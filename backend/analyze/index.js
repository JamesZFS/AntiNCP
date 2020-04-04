// Data analysis module
'use strict';
const chalk = require('chalk');
const debug = require('debug')('backend:analyze');
const dateFormat = require('dateformat');
const ProgressBar = require('progress');
const db = require('../database');
const wi = require('./word-index');
const scheduler = require('../scheduler');

Date.prototype.addDay = function (days = 1) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

// Refresh WordIndex table (will clean first)
async function refreshWordIndex() {
    debug('Refreshing WordIndex table...');
    try {
        let articles = await db.selectArticles('*');
        wi.preprocessArticles(articles);
        var wordIndex = wi.createWordIndex_tfidf(articles);
        var oldRows = await db.countTableRows('WordIndex');
        await db.clearTable('WordIndex'); // todo use tmp table and alter name
        await wi.storeWordIndex(wordIndex);
        var newRows = await db.countTableRows('WordIndex');
    } catch (err) {
        console.error(chalk.red('Error when refreshing WordIndex:'), err.message);
        throw err;
    }
    debug('Refreshing WordIndex success.', chalk.green(`[+] ${newRows - oldRows} words.`, `${newRows} words in total.`));
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
        console.log(dateMin.toLocaleDateString(), dateMax.toLocaleDateString());
        // fetch articles within each day
        let bar = new ProgressBar('  computing trends [:bar] :rate/bps :percent :etas', {
            complete: '=',
            incomplete: ' ',
            head: '>',
            width: 20,
            total: (dateMax - dateMin) / (24 * 3600 * 1000) + 1
        });
        for (let date = dateMin; date <= dateMax; date = date.addDay()) {
            bar.tick();
            let lower = db.escape(dateFormat(date, 'yyyy-mm-dd'));
            let upper = db.escape(dateFormat(date.addDay(), 'yyyy-mm-dd'));
            let articles = await db.selectArticles('*', `date BETWEEN ${lower} AND ${upper}`);
            wi.preprocessArticles(articles);
            let trends = new Map(); // trends of the day
            for (let article of articles) {
                article.tokens.forEach(token => {
                    let oldVal = trends.get(token) || 0;
                    trends.set(token, oldVal + article.pagerank);
                });
            }
            // insert into db
            let entries = [];
            for (let [word, value] of trends.entries()) {
                entries.push({
                    date: lower,
                    word: db.escape(word),
                    value: db.escape(value)
                });
            }
            await db.insertEntries('Trends', entries);
        }
        var newRows = await db.countTableRows('Trends');
    } catch (err) {
        console.error(chalk.red('Error when refreshing Trends:'), err.message);
        throw err;
    }
    debug('Refreshing Trends success.', chalk.green(`[+] ${newRows - oldRows} words.`, `${newRows} words in total.`));
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
