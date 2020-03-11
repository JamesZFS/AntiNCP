// Auto data fetching system
const debug = require('debug')('backend:fetcher');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const download = require('download');
const db = require('../database/db-manager');
const scheduler = require('./scheduler');
const DXYAreaDataDir = 'public/data/area/';
const dataSource = require('../config/third-party');
const expectedFields = ['updateTime', 'provinceName', 'cityName', 'city_confirmedCount', 'city_suspectedCount', 'city_curedCount', 'city_deadCount'];
const dbEntryFields = ['time', 'province', 'city', 'confirmedCount', 'suspectedCount', 'curedCount', 'deadCount'];

/**
 * Inserting epidemic data from DXY area data csv into database, asynchronously
 * This takes countable seconds to finish
 * @param csvPath{string}
 * @param batchSize{int}
 * @param strict{bool} if true, stop parsing when encounter an error row
 * @return {Promise<int>}
 */
function insertEpidemicDataFromDXYAreaData(csvPath, batchSize = 10000, strict = true) {
    return new Promise((resolve, reject) => {
        let firstLine = true;
        let field2index = {};
        let count = 0;
        let entryBatch = [];
        debug(`inserting epidemic data from DXY area data csv ${csvPath}`);
        let parser = csv.parseFile(csvPath)
            .on('error', error => {
                debug(`error when parsing csv file ${csvPath}`);
                reject(error);
            })
            .on('data', async row => {
                if (firstLine) { // table head
                    firstLine = false;
                    for (let i = 0; i < expectedFields.length; ++i) {
                        let idx = row.indexOf(expectedFields[i]);
                        if (idx < 0) {
                            parser.end();
                            reject(`expected field ${expectedFields[i]} not found in csv.`);
                            return;
                        }
                        field2index[dbEntryFields[i]] = idx;
                    }
                    return;
                }
                // table data
                let entry = {};
                entry['country'] = '中国'; // default
                for (let field in field2index) {
                    entry[field] = row[field2index[field]];
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
        let csvPath = selectNewestFile(DXYAreaDataDir, '.csv');
        if (csvPath === undefined) { // no csv found
            await downloadEpidemicData();
            return reloadEpidemicData();
        }
        await db.clearTable('Epidemic');
        await insertEpidemicDataFromDXYAreaData(csvPath, 10000, true);
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
    let filePath = path.join(DXYAreaDataDir, Date.now() + '.csv');
    try {
        await download(dataSource.DXY_AREA_API, filePath);
    } catch (err) {
        debug('Fail to download epidemic data.');
        fs.unlinkSync(filePath);
        throw err;
    }
}

function selectNewestFile(dir, suffix = 'csv') {
    if (!suffix.startsWith('.')) suffix = '.' + suffix;
    let files = fs.readdirSync(dir);
    files = files.filter(val => val.endsWith(suffix)); // neglect stuffs like .DS_STORE
    if (files.length === 0) return undefined;
    files.sort(function (a, b) {
        let pb = parseInt(b);
        return isNaN(pb) ? -1 : pb - parseInt(a);
    });
    return path.join(dir, files[0]);
}

// download newest csv and update db twice a day
scheduler.jobTwiceADay.callback = async function () {
    debug('Auto update begins.');
    await downloadEpidemicData();
    await reloadEpidemicData();
    debug('Auto update finished.');
};

module.exports = {
    reloadEpidemicData, downloadEpidemicData,
    scheduler
};
