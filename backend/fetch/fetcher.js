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
 * @return {Promise}
 */
function insertEpidemicDataFromDXYAreaData() {
    return new Promise((resolve, reject) => {
        let firstLine = true;
        let field2index = {};
        debug('inserting epidemic data from DXY area data csv...');
        csv.parseFile(DXYAreaDataCSVPath)
            .on('error', error => {
                debug(`error when parsing csv file ${DXYAreaDataCSVPath}`);
                reject(error);
            })
            .on('data', row => {
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
                // table data
                let entry = {};
                entry['country'] = '中国'; // default
                for (let field in field2index) {
                    entry[field] = row[field2index[field]];
                }
                db.insertEpidemicEntry(entry).catch(reject);
            })
            .on('end', rowCount => {
                debug(`successfully parsed ${rowCount} rows`);
                resolve(); // todo csv reading stream finishes earlier than db queries, bug occurs
            });
    });
}

module.exports = {
    insertEpidemicDataFromDXYAreaData
};
