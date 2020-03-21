// Auto data fetching system
const debug = require('debug')('backend:fetcher');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const download = require('download-file');
const db = require('../database/db-manager');
const scheduler = require('./scheduler');
const dataSource = require('../config/third-party').CHL; // may select other data sources

/**
 * Inserting epidemic data from area data csv into database, asynchronously
 * This takes countable seconds to finish
 * @param csvPath{string}
 * @param header2DBField{Object} a dict indicates a map from csv header to db field
 * @param batchSize{int}
 * @param strict{bool} if true, stop parsing when encounter an error row
 * @return {Promise<int>}
 */
function insertEpidemicDataFromCSVAreaData(csvPath, header2DBField, batchSize = 10000, strict = true) {
    return new Promise((resolve, reject) => {
        let firstLine = true;
        let field2Index = {};
        let count = 0;
        let entryBatch = [];
        let specifyCountry = Object.values(header2DBField).indexOf('country') >= 0;
        debug(`inserting epidemic data from DXY area data csv ${csvPath}`);
        let parser = csv.parseFile(csvPath)
            .on('error', error => {
                debug(`error when parsing csv file ${csvPath}`);
                reject(error);
            })
            .on('data', async row => {
                if (firstLine) { // table head
                    firstLine = false;
                    for (let [header, dbField] of Object.entries(header2DBField)) {
                        let idx = row.indexOf(header);
                        if (idx < 0) {
                            parser.end();
                            reject(`expected field ${header} not found in csv.`);
                            return;
                        }
                        field2Index[dbField] = idx;
                    }
                    return;
                }
                // table data
                let entry = {};
                if (!specifyCountry) entry['country'] = '中国'; // default
                for (let field in field2Index) {
                    entry[field] = row[field2Index[field]];
                }
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
        await db.clearTable('Epidemic');
        await insertEpidemicDataFromCSVAreaData(csvPath, dataSource.header2DBField, 10000, true);
        await db.countTableRows('Epidemic');
    } catch (err) {
        debug('Fail to reload epidemic data.');
        throw err;
    }
}

/**
 * Download epidemic data from dxy api, save it to DXYAreaDataDir
 */
async function downloadEpidemicData() {
    debug('Downloading Epidemic Data... (Be patient, this may take a while)');
    let filePath = path.join(dataSource.downloadDir, Date.now() + '.csv');
    try {
        await new Promise((resolve, reject) => download(dataSource.areaAPI, {
            directory: dataSource.downloadDir,
            filename: Date.now() + '.csv',
        }, err => {
            if (err) reject(err);
            else resolve();
        }));
    } catch (err) {
        debug('Fail to download epidemic data.');
        fs.unlinkSync(filePath);
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

// download newest csv and update db twice a day
scheduler.scheduleJob(scheduler.onceADay, async function (time) {
    debug(`Auto update begins at ${time}`);
    await downloadEpidemicData();
    await reloadEpidemicData();
    debug('Auto update finished.');
});

module.exports = {
    reloadEpidemicData, downloadEpidemicData,
    scheduler
};
