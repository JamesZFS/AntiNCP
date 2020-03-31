'use strict';
// Auto data fetching system
const debug = require('debug')('backend:fetcher');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const download = require('download-file');
const chalk = require('chalk');
const db = require('../database/db-manager');
const scheduler = require('./scheduler');
const cache = require('../routes/retrieve/cache');
const dataSource = require('../config/third-party').CHL; // may select other data sources

/**
 * Inserting epidemic data from area data csv into database, asynchronously
 * This takes countable seconds to finish
 * @param csvPath{string}
 * @param expColumns{string[]} expected columns in the csv, throw if not meet
 * @param row2Entry{callback} a function that converts a map from csv header to db field
 * @param batchSize{int}
 * @param strict{bool} if true, stop parsing when encounter an error row
 * @return {Promise<int>}
 */
function insertEpidemicDataFromCSVAreaData(csvPath, expColumns, row2Entry, batchSize = 10000, strict = true) {
    return new Promise((resolve, reject) => {
        let firstLine = true;
        let columns = []; // column names
        let count = 0;
        let entryBatch = [];
        debug(`inserting epidemic data from source area data csv ${csvPath}`);
        let parser = csv.parseFile(csvPath)
            .on('error', error => {
                parser.end();
                console.error(chalk.red(`insertEpidemicData: Error when parsing csv file ${csvPath}`));
                reject(error);
            })
            .on('data', async newRow => {
                if (firstLine) { // table head
                    firstLine = false;
                    columns = newRow;
                    // check if columns are expected
                    let missingColumns = expColumns.filter(col => columns.indexOf(col) < 0);
                    if (missingColumns.length > 0) {
                        parser.end();
                        console.error(chalk.red(`insertEpidemicData: Expected columns ${missingColumns} not found in the csv ${csvPath}`));
                        reject(new Error);
                    }
                    return;
                }
                // table data
                let rowObj = {};
                columns.forEach((col, idx) => rowObj[col] = newRow[idx]);
                let entry = row2Entry(rowObj);  // convert into db acceptable form
                entryBatch.push(entry);
                if (++count % batchSize === 0) {   // insert batch into db
                    debug(`parsed ${count} rows.`);
                    parser.pause(); // wait for db to finish insertion
                    await db.insertEpidemicEntries(entryBatch).catch(err => {
                        debug('parsing error row:', err);
                        if (strict) {
                            parser.end();
                            reject(err);
                        }
                    });
                    entryBatch = [];
                    parser.resume();
                }
            })
            .on('end', async rowCount => {
                // insert remaining rows
                await db.insertEpidemicEntries(entryBatch).catch(err => {
                    debug('parsing error row:', err);
                    if (strict) reject(err)
                });
                debug(`Successfully parsed ${rowCount} rows`);
                resolve(rowCount);
            });
    });
}

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
        await insertEpidemicDataFromCSVAreaData(csvPath, dataSource.expColumns, dataSource.parseRow, 10000, true);
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
