'use strict';
// Auto data fetching system
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
const {WGET_TIMEOUT} = require('./config');
const epidemicSource = require('./third-party/epidemic').CHL; // may select other data sources
const articleSources = require('./third-party/articles').ALL; // may select other article sources

/**
 * Reload epidemic data in the db, auto-selecting the newest csv file
 * auto download if no csv is found
 */
async function reloadEpidemicData() {
    try {
        let csvPath = csv.selectNewestFile(epidemicSource.downloadDir);
        if (csvPath === null) { // if no csv found
            await downloadEpidemicData(); // download data from source and then reload
            return reloadEpidemicData();
        }
        let oldRowCount = await db.countTableRows('Epidemic');
        cache.flush();
        await db.clearTable('Epidemic');
        await csv.batchReadAndMap(csvPath, epidemicSource.expColumns, epidemicSource.parseRow, db.insertEpidemicEntries, 10000);
        await db.refreshAvailablePlaces('Epidemic');
        let newRowCount = await db.countTableRows('Epidemic');
        debug(chalk.green(`[+] ${newRowCount - oldRowCount} rows`), ` ${newRowCount} rows of epidemic data in total.`);
    } catch (err) {
        console.error(chalk.red('Fail to reload epidemic data.'), err.message);
        throw new Error('Fail to reload epidemic data.');
    }
}

/**
 * Download epidemic data from source api, save it to downloadDir
 */
async function downloadEpidemicData() {
    const url = epidemicSource.areaAPI;
    const filePath = path.join(epidemicSource.downloadDir, Date.now() + '.csv');
    debug(`Downloading Epidemic Data from ${url} into ${filePath} ... (Be patient, this may take a while)`);
    let trial = scheduler.fetchingPolicy.maxTrials;
    while (true) {
        try {
            await wget(url, filePath, true, {timeout: WGET_TIMEOUT});
        } catch (err) {
            debug(`Fail to downlaod, retry in ${scheduler.fetchingPolicy.interval / 60000} mins.`);
            if (--trial > 0) {
                await scheduler.sleep(scheduler.fetchingPolicy.interval);
                continue;
            } else {  // give up
                console.error(chalk.red('Fail to download from csv epidemic source. Skip this download.'), err.message);
                throw err;
            }
        }
        break; // success
    }
    debug('Download success.');
}

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

// Scheduler: download newest csv and update db once a day
function initialize() {
    // Update epidemic data daily:
    scheduler.scheduleJob(scheduler.onceADay, async function (time) {
        debug('Auto update begins at', chalk.bgGreen(`${time}`));
        try {
            await downloadEpidemicData();
            await reloadEpidemicData();
            csv.cleanDirectoryExceptNewest(epidemicSource.downloadDir);
            debug('Auto update finished.');
        } catch (err) {
            debug(`Auto update aborted.`);
        }
    });
    // Update virus articles incrementally
    scheduler.scheduleJob(scheduler.every.Hour, async function (time) {
        debug('Auto update begins at', chalk.bgGreen(`${time}`));
        try {
            let {startId, endId} = await fetchVirusArticles();
            if (startId < endId) { // has update
                // update index tables incrementally
                await analyzer.updateWordIndex(startId, endId - 1);
                // let dateMin = (await db.doSql(`SELECT date FROM Articles WHERE id = ${startId}`))[0].date;
                // let dateMax = (await db.doSql(`SELECT date FROM Articles WHERE id = ${endId - 1}`))[0].date;
                for (let table of ['Trends', 'TrendsSumUp'])
                    await db.clearTable(table);
                await analyzer.updateTrends(); // refresh for convenience
            }
            debug('Auto update finished.');
        } catch (err) {
            debug('Auto update aborted.');
            console.error(err);
        }
    });
}

module.exports = {
    reloadEpidemicData, downloadEpidemicData, fetchVirusArticles, initialize
};
