'use strict';
// Auto data fetching system
const dateFormat = require('dateformat');
const debug = require('debug')('backend:fetcher');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const db = require('../database');
const analyzer = require('../analyze');
const scheduler = require('../utils/scheduler');
const cache = require('../routes/retrieve/cache');
const wget = require('../utils/wget');
const csv = require('./csv');
const rss = require('./rss');
const {CHL, JHU} = require('./third-party/epidemic');
const articleSources = require('./third-party/articles').ALL; // may select other article sources
require('../utils/date');

/**
 * Fetch articles related to virus, insert into db (INCREMENTALLY)
 * @return {Promise<{startId: int, endId: int}>}  range of newly inserted db entry (startId <= endId, specially, s == e means no update)
 */
async function fetchVirusArticles() {
    debug('Fetching virus articles...');
    try {
        var startId = (await db.selectInTable('Articles', 'MAX(id) AS res'))[0].res + 1;
        let entries;
        let trial = scheduler.fetchingPolicy.maxTrials;
        while (true) {
            try {
                entries = await rss.getArticlesFromRss(articleSources, rss.isAboutVirus, rss.article2Entry);
                if (!entries || entries.length === 0) throw new Error();
            } catch (err) { // retry
                debug(`Fail to fetch, retry in ${scheduler.fetchingPolicy.interval / 60000} mins.`);
                if (--trial > 0) {
                    await scheduler.sleep(scheduler.fetchingPolicy.interval);
                    continue;
                } else {  // give up
                    console.error(chalk.red('Fail to fetch from rss article source. Skip this update.'), err.message);
                    return {startId, endId: startId};
                }
            }
            break; // success
        }
        debug('Fetching success.');
        let backupFile = path.resolve(__dirname, '../public/data/rss/RSS-backup.txt');
        if (!fs.existsSync(backupFile)) fs.mkdirSync(path.dirname(backupFile), {recursive: true});
        // let entries = JSON.parse(fs.readFileSync(backupFile));
        fs.writeFileSync(backupFile, JSON.stringify(entries, null, 4)); // backup
        debug(`Articles backed up into ${backupFile}`);
        await db.insertArticleEntries(entries);
        var endId = (await db.selectInTable('Articles', 'MAX(id) AS res'))[0].res + 1;
        debug('Virus article fetching success.', chalk.green(`[+] ${endId - startId} rows.`), `In total ${endId - 1} rows in db.`);
    } catch (err) {
        console.error(chalk.red('Fatal error when fetching articles:'), err.message);
        throw err;
    }
    return {startId, endId};
}

async function fetchVirusArticlesAndAnalyze() {
    let {startId, endId} = await fetchVirusArticles();
    if (startId < endId) { // has update
        // update index tables incrementally
        await analyzer.updateWordIndex(startId, endId - 1);
        // let dateMin = (await db.doSql(`SELECT date FROM Articles WHERE id = ${startId}`))[0].date;
        // let dateMax = (await db.doSql(`SELECT date FROM Articles WHERE id = ${endId - 1}`))[0].date;
        await analyzer.refreshTrends(); // refresh for convenience
    }
}

// Fetch epidemic data on `date` and store in db **incrementally** (data of the **same day** will be **overwritten**)
async function fetchEpidemicData(epidemicSource, date) {
    // Download:
    let apiDateStr = dateFormat(date, epidemicSource.apiDateFormat);
    let api = epidemicSource.dateAPI.replace(':date', apiDateStr);
    let filePath = path.join(epidemicSource.downloadDir, 'tmp.csv');
    debug(`Downloading Epidemic Data from ${api} into ${filePath} ...`);
    try {
        await wget(api, filePath, true, true);
    } catch (err) {
        return; // skip this fetch
    }
    debug('Download success.');
    // Load incrementally:
    let oldRowCount = await db.countTableRows('Epidemic');
    await cache.flush();
    await csv.batchReadAndMap(filePath, epidemicSource.expColumns, epidemicSource.parseRow, db.insertEpidemicEntries, 10000);
    let newRowCount = await db.countTableRows('Epidemic');
    debug(chalk.green(`[+] ${newRowCount - oldRowCount} rows`), ` ${newRowCount} rows of epidemic data in total.`);
}

// Compensate provincial data on specified date
async function calculateProvinceData(epidemicSource, date) {
    date = dateFormat(date, 'yyyy-mm-dd');
    if (!epidemicSource.hasProvinceData) {
        await db.doSql(`
INSERT IGNORE INTO Epidemic (date, country, city, province, confirmedCount, curedCount, deadCount)
SELECT date,country,'',province,SUM(confirmedCount),SUM(curedCount),SUM(deadCount)
From Epidemic WHERE date=${db.escape(date)} AND country=${db.escape(epidemicSource.sourceCountry)} AND province!='' AND city!='' GROUP BY province`);
    }
}

// Clear and reload available places from source table (should contain field `country`, `province`, and `city`)
function refreshAvailablePlaces() {
    return db.doSqls([
        'TRUNCATE TABLE Places;', // clear
        'INSERT INTO Places (country, province, city) SELECT DISTINCT country, province, city FROM AntiNCP.Epidemic;'
    ]);
}


// Clear all before fetch.
// Transaction is not applied here. Be cautious of using this!
async function reFetchEpidemicData() {
    await db.clearTable('Epidemic');
    for (let date = new Date(CHL.storyBegins); date <= new Date(); date = date.addDay()) {
        await fetchEpidemicData(CHL, date);
    }
    // await db.doSql(`DELETE FROM Epidemic WHERE country='美国' AND province!=''`);
    for (let date = new Date(JHU.storyBegins); date <= new Date().addDay(-1); date = date.addDay()) {
        await fetchEpidemicData(JHU, date);
        await calculateProvinceData(JHU, date);
    }
    await refreshAvailablePlaces();
}

async function clearEpidemicOn(date) {
    return db.doSql(`DELETE FROM Epidemic WHERE date=${db.escape(dateFormat(date, 'yyyy-mm-dd'))}`);
}

async function fetchAll() {
    // Articles:
    await fetchVirusArticlesAndAnalyze();
    // Epidemic:
    let today = new Date();
    await db.beginTransaction(); // atomic operations begin
    await clearEpidemicOn(today);
    await Promise.all([
        fetchEpidemicData(CHL, today),
        fetchEpidemicData(JHU, today.addDay(-1)), // this source updates only to yesterday
    ]);
    await refreshAvailablePlaces();
    await calculateProvinceData(JHU, today);
    await db.commit(); // atomic end
}

function initialize() {
    // Update epidemic data and virus articles incrementally
    scheduler.scheduleJob(scheduler.every.Hour, async function (time) {
        debug('Auto update begins at', chalk.bgGreen(`${time}`));
        try {
            await fetchAll();
            debug('Auto update finished.');
        } catch (err) {
            debug('Auto update aborted.');
            console.error(err);
        }
    });
}

module.exports = {
    fetchAll, initialize, reFetchEpidemicData
};
