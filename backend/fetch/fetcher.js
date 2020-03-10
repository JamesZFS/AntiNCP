// Auto data fetching system
const debug = require('debug')('backend:fetcher');
const csv = require('fast-csv');
const db = require('../database/db-manager');
const DXYAreaDataCSVPath = 'public/data/DXYArea.csv';

const expectedFields = ['updateTime', 'provinceName', 'cityName', 'city_confirmedCount', 'city_suspectedCount', 'city_curedCount', 'city_deadCount'];
const dbEntryFields = ['time', 'province', 'city', 'confirmedCount', 'suspectedCount', 'curedCount', 'deadCount'];

/**
 * Inserting epidemic data from DXY area data csv into database, asynchronously
 * This takes countable seconds to finish
 * @param strict{bool} if true, stop parsing when encounter an error row
 * @return {Promise<int>}
 */
function insertEpidemicDataFromDXYAreaData(strict = true) {
    return new Promise((resolve, reject) => {
        let firstLine = true;
        let field2index = {};
        let count = 0;
        debug('inserting epidemic data from DXY area data csv...');
        let parser = csv.parseFile(DXYAreaDataCSVPath)
            .on('error', error => {
                debug(`error when parsing csv file ${DXYAreaDataCSVPath}`);
                reject(error);
            })
            .on('data', async row => {
                if (firstLine) { // table head
                    firstLine = false;
                    for (let i = 0; i < expectedFields.length; ++i) {
                        let idx = row.indexOf(expectedFields[i]);
                        if (idx < 0) {
                            reject(`expected field ${expectedFields[i]} not found in csv.`);
                            return;
                        }
                        field2index[dbEntryFields[i]] = idx;
                    }
                    return;
                }
                if (++count % 10000 === 0) debug(`parsed ${count} rows.`);
                // table data
                let entry = {};
                entry['country'] = '中国'; // default
                for (let field in field2index) {
                    entry[field] = row[field2index[field]];
                }
                parser.pause(); // wait for db to finish insertion
                db.insertEpidemicEntry(entry)
                    .then(() => parser.resume())
                    .catch(err => {
                        debug('parsing error row:', err);
                        if (strict) {
                            parser.end();
                            reject(err);
                        }
                    });
            })
            .on('end', rowCount => {
                debug(`successfully parsed ${rowCount} rows`);
                resolve(rowCount);
            });
    });
}

module.exports = {
    insertEpidemicDataFromDXYAreaData
};
