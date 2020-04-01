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
const dataSource = require('../config/third-party/epidemic').CHL; // may select other data sources

/**
 * Reload epidemic data in the db, auto-selecting the newest csv file
 * auto download if no csv is found
 */
async function reloadEpidemicData() {
    try {
        let csvPath = selectNewestFile(dataSource.downloadDir, '.csv');
        if (csvPath === null) { // if no csv found
            await downloadEpidemicData(); // download data from source and then reload
            return reloadEpidemicData();
        }
        await cache.flush();
        await db.clearTable('Epidemic');
        await csv.batchReadAndMap(csvPath, dataSource.expColumns, dataSource.parseRow, db.insertEpidemicEntries, 10000);
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
    const url = dataSource.areaAPI;
    const filePath = path.join(dataSource.downloadDir, Date.now() + '.csv');
    debug(`Downloading Epidemic Data from ${url} into ${filePath} ... (Be patient, this may take a while)`);
    try {
        await new Promise((resolve, reject) => download(url, {
            directory: dataSource.downloadDir,
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
        debug('Fail to download epidemic data.', err);
        throw err;
    }
}

function selectNewestFile(dir, suffix = 'csv') {
    if (!suffix.startsWith('.')) suffix = '.' + suffix;
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (err) {
        fs.mkdirSync(dir);
        return null;
    }
    files = files.filter(val => val.endsWith(suffix)); // neglect stuffs like .DS_STORE
    if (files.length === 0) return null;
    files.sort(function (a, b) {
        let pb = parseInt(b);
        return isNaN(pb) ? -1 : pb - parseInt(a);
    });
    return path.join(dir, files[0]);
}

// Scheduler: download newest csv and update db once a day
function initialize() {
    scheduler.scheduleJob(scheduler.onceADay, async function (time) {
        debug(`Auto update begins at ${time}`);
        await downloadEpidemicData();
        await reloadEpidemicData();
        debug('Auto update finished.');
    });
}

module.exports = {
    reloadEpidemicData, downloadEpidemicData, initialize, dataSource: dataSource.areaAPI
};
