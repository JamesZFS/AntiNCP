'use strict';
const debug = require('debug')('backend:fetcher:csv');
const csv = require('fast-csv');
const chalk = require('chalk');

/**
 * Read csv and map each entry w.r.t `row2Entry` callback, call `onBatch` callback when a batch of entries is ready, asynchronously
 * This takes countable seconds to finish
 * @param csvPath{string}
 * @param expColumns{string[]} expected columns in the csv, throw if not meet
 * @param row2Entry{callback} a function that converts a map from csv header to db field
 * @param onBatch{callback} a function that takes a batch of entries, eg. `db.insertEpidemicEntries` method
 * @param batchSize{int}
 * @return {Promise<int>}
 */
function batchReadAndMap(csvPath, expColumns, row2Entry, onBatch, batchSize = 10000) {
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
                    await onBatch(entryBatch).catch(err => {
                        debug('parsing error row:', err);
                        parser.end();
                        reject(err);
                    });
                    entryBatch = [];
                    parser.resume();
                }
            })
            .on('end', async rowCount => {
                // insert remaining rows
                await onBatch(entryBatch).catch(err => {
                    debug('parsing error row:', err);
                    if (strict) reject(err)
                });
                debug(`Successfully parsed ${rowCount} rows`);
                resolve(rowCount);
            });
    });
}

module.exports = {batchReadAndMap};
