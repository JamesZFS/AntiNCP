// Data analysis module
'use strict';
const chalk = require('chalk');
const debug = require('debug')('backend:analyze');
const db = require('../database');
const wi = require('./word-index');
const trends = require('./trends');
const scheduler = require('../scheduler');


// Refresh WordIndex table (will clean first)
async function refreshWordIndex() {
    debug('Refreshing WordIndex table...');
    try {
        let articles = await db.selectArticles('*');
        wi.preprocessArticles(articles);
        var wordIndex = wi.createWordIndex_tfidf(articles); // takes a long time
        var oldRows = await db.countTableRows('WordIndex');
        await db.clearTable('WordIndex'); // todo use tmp table and alter name
        await wi.storeWordIndex(wordIndex);
        var newRows = await db.countTableRows('WordIndex');
    } catch (err) {
        console.error(chalk.red('Error when refreshing WordIndex:'), err.message);
        throw err;
    }
    debug('Refreshing WordIndex success.', chalk.green(`[+] ${newRows - oldRows} words.`), `${newRows} words in total.`);
    return wordIndex;
}

// Refresh Trends table (will clean first)
async function refreshTrends() {
    debug('Refreshing Trends table...');
    try {
        var oldRows = await db.countTableRows('Trends');
        await db.clearTable('Trends'); // todo use tmp table and alter name
        let res = await db.selectArticles(['MAX(date)', 'MIN(date)']);
        let dateMax = new Date(res[0]['MAX(date)']), dateMin = new Date(res[0]['MIN(date)']);
        dateMin = new Date(dateMin.toLocaleDateString());
        dateMax = new Date(dateMax.toLocaleDateString());
        // fetch articles within each day
        await trends.storeTrendsWithin(dateMin, dateMax);
        var newRows = await db.countTableRows('Trends');
    } catch (err) {
        console.error(chalk.red('Error when refreshing Trends:'), err.message);
        throw err;
    }
    debug('Refreshing Trends success.', chalk.green(`[+] ${newRows - oldRows} words.`), `${newRows} words in total.`);
}

function initialize() {
    // Update WordIndex and Trends table periodically
    scheduler.scheduleJob(scheduler.every.Hour, async function (time) {
        debug(`Auto update begins at ${time}`);
        try {
            await refreshWordIndex();
            await refreshTrends();
            debug('Auto update finished.');
        } catch (err) {
            debug(`Auto update aborted.`);
        }
    });
}

module.exports = {refreshTrends, refreshWordIndex, initialize};
