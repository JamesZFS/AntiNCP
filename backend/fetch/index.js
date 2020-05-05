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
    let dateStr = dateFormat(date, 'yyyy-mm-dd');
    let api = epidemicSource.dateAPI.replace(':date', dateStr);
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
    await db.doSql(`DELETE FROM Epidemic WHERE date=${db.escape(dateStr)}`); // clear old records of this date
    await csv.batchReadAndMap(filePath, epidemicSource.expColumns, epidemicSource.parseRow, db.insertEpidemicEntries, 10000);
    await db.refreshAvailablePlaces();
    let newRowCount = await db.countTableRows('Epidemic');
    debug(chalk.green(`[+] ${newRowCount - oldRowCount} rows`), ` ${newRowCount} rows of epidemic data in total.`);
}

// Clear all before fetch.
// Be cautious of using this.
async function reFetchEpidemicData() {
    await db.clearTable('Epidemic');
    for (let date = new Date(CHL.storyBegins); date <= new Date(); date = date.addDay()) {
        await fetchEpidemicData(CHL, date);
    }
    for (let date = new Date(JHU.storyBegins); date <= new Date(); date = date.addDay()) {
        await fetchEpidemicData(JHU, date);
    }
}

async function fetchAll() {
    let today = new Date();
    return Promise.all([
        fetchEpidemicData(CHL, today),
        fetchEpidemicData(JHU, today),
        fetchVirusArticlesAndAnalyze()
    ])
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
