'use strict';
// Auto data fetching system
const debug = require('debug')('backend:fetcher');
const fs = require('fs');
const path = require('path');
const download = require('download-file');
const chalk = require('chalk');
const db = require('../database');
const scheduler = require('./scheduler');
const cache = require('../routes/retrieve/cache');
const csv = require('./csv');
const rss = require('./rss');
const epidemicSource = require('../config/third-party/epidemic').CHL; // may select other data sources
const articleSources = require('../config/third-party/articles').ALL; // may select other article sources

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
        await cache.flush();
        await db.clearTable('Epidemic');
        await csv.batchReadAndMap(csvPath, epidemicSource.expColumns, epidemicSource.parseRow, db.insertEpidemicEntries, 10000);
        await db.refreshAvailablePlaces('Epidemic');
        let rows = await db.countTableRows('Epidemic');
        debug(`Loaded ${rows} rows of data in total.`);
    } catch (err) {
        debug('Fail to reload epidemic data.');
        throw err;
    }
}

/**
 * Download epidemic data from source api, save it to downloadDir
 */
async function downloadEpidemicData() {
    const url = epidemicSource.areaAPI;
    const filePath = path.join(epidemicSource.downloadDir, Date.now() + '.csv');
    debug(`Downloading Epidemic Data from ${url} into ${filePath} ... (Be patient, this may take a while)`);
    try {
        await new Promise((resolve, reject) => download(url, { // insist downloading
            directory: epidemicSource.downloadDir,
            filename: Date.now() + '.csv',
        }, err => { // this promise tries to (re)download the target
            if (err) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                }
                console.error(`Download error: when trying to download from ${url},`, chalk.red(err.code));
                debug('Try re-downloading in 10 minutes...');
                setTimeout(() => downloadEpidemicData()
                    .then(() => resolve())
                    .catch(err => reject(err)), 600000); // 10 mins
            } else {
                debug('Downloaded successfully.');
                resolve();
            }
        }));
    } catch (err) {
        console.error(chalk.red('Fail to download epidemic data:'), err.message);
        throw err;
    }
}

/**
 * Fetch articles related to virus
 * @return {Promise<void>}
 */
async function fetchVirusArticles() {
    debug('Fetching virus articles...');
    try {
        let entries = await rss.getArticlesFromRss(articleSources, rss.isAboutVirus, rss.article2Entry);
        await db.insertArticleEntries(entries);
        let rows = await db.countTableRows('Articles');
        debug('Virus article fetching success.', chalk.green(`In total ${rows} rows in db.`));
    } catch (err) {
        console.error(chalk.red('Fail to fetch articles:'), err.message);
        throw err;
    }
}

// Scheduler: download newest csv and update db once a day
function initialize() {
    // Update epidemic data daily:
    scheduler.scheduleJob(scheduler.onceADay, async function (time) {
        debug(`Auto update begins at ${time}`);
        await downloadEpidemicData();
        await reloadEpidemicData();
        csv.cleanDirectoryExceptNewest(epidemicSource.downloadDir);
        debug('Auto update finished.');
    });
    // Update virus articles incrementally
    scheduler.scheduleJob(scheduler.every.thirtyMins, async function (time) {
        debug(`Auto update begins at ${time}`);
        await fetchVirusArticles();
        // todo analyze data
        debug('Auto update finished.');
    });
}

module.exports = {
    reloadEpidemicData, downloadEpidemicData, initialize, dataSource: epidemicSource.areaAPI
};
