'use strict';
const ProgressBar = require('progress');
const dateFormat = require('dateformat');
const chalk = require('chalk');
const debug = require('debug')('backend:analyze');
const db = require('../database');
const {preprocessArticles} = require('./preprocess');
const {TRENDS_WINDOW_DAYS} = require('./config');
require('../utils/date');

/**
 * Add trends items within date range into db
 * should be called at most once a day
 * @param dateMin{Date}
 * @param dateMax{Date}
 * @return {Promise<void>}
 */
async function storeTrendsWithin(dateMin, dateMax) {
    const newDays = Math.ceil(dateMax.dayDiff(dateMin)) + 1;
    let bar = new ProgressBar('  computing trends [:bar] :rate/bps :percent :etas', {
        complete: '=',
        incomplete: ' ',
        head: '>',
        width: 20,
        total: newDays
    });
    let trendsSumUp = new Map(); // stem -> set(days occurred)
    for (let date = dateMin; date <= dateMax; date = date.addDay()) {
        bar.tick();
        let lower = db.escape(dateFormat(date, 'yyyy-mm-dd'));
        let upper = db.escape(dateFormat(date.addDay(), 'yyyy-mm-dd'));
        // articles of the day:
        let articles = await db.selectArticles('*', `date BETWEEN ${lower} AND ${upper}`);
        if (articles.length === 0) continue;
        preprocessArticles(articles);
        let trends = new Map(); // trends of the day, stem -> freq of the day
        let total = 0.0;
        for (let article of articles) {
            article.tokens.forEach(stem => {
                let oldVal = trends.get(stem) || 0;
                total += article.pagerank;
                trends.set(stem, oldVal + article.pagerank);
                if (trendsSumUp.has(stem)) trendsSumUp.get(stem).add(date);
                else trendsSumUp.set(stem, new Set([date]));
            });
        }
        // insert into db
        let entries = [];
        for (let [stem, count] of trends.entries()) {
            entries.push({
                date: lower,
                stem: db.escape(stem),
                freq: db.escape(count / total)
            });
        }
        await db.insertEntries('Trends', entries);
    }
    // const {globalDateMin, globalDateMax} = (await db.doSql('SELECT MIN(date) AS globalDateMin, MAX(date) AS globalDateMax FROM Articles'))[0];
    // const totalDays = Math.ceil(new Date(globalDateMax).dayDiff(new Date(globalDateMin)) + 1);
    // const oldDays = totalDays - newDays;
    let entries = [...trendsSumUp.entries()].map(([stem, days]) => {
        return {
            stem: db.escape(stem),
            count: days.size
        }
    });
    await db.insertEntries('TrendsSumUp', entries, `ON DUPLICATE KEY UPDATE count = count + VALUES(count)`);
}

/** Update Trends table incrementally
 * @param dateMin{string}
 * @param dateMax{string}
 * @return {Promise<void>}
 */
async function updateTrends(dateMin, dateMax) {
    debug('Updating Trends table...');
    try {
        var oldRows = await db.countTableRows('Trends');
        dateMin = new Date(dateMin);
        dateMax = new Date(dateMax);
        // fetch articles within each day
        await storeTrendsWithin(dateMin, dateMax);
        var newRows = await db.countTableRows('Trends');
    } catch (err) {
        console.error(chalk.red('Error when updating Trends:'), err.message);
        throw err;
    }
    debug('Update Trends success.', chalk.green(`[+] ${newRows - oldRows} words.`), `${newRows} words in total.`);
}

async function refreshTrends() {
    debug('Refreshing Trends table...');
    try {
        var oldRows = await db.countTableRows('Trends');
        // clear old:
        for (let table of ['Trends', 'TrendsSumUp']) await db.clearTable(table);
        let dateMin = new Date().addDay(-TRENDS_WINDOW_DAYS);
        let dateMax = new Date();
        // store new:
        await storeTrendsWithin(dateMin, dateMax);
        var newRows = await db.countTableRows('Trends');
    } catch (err) {
        console.error(chalk.red('Error when refreshing Trends:'), err.message);
        throw err;
    }
    debug('Refreshing Trends success.', chalk.green(`[+] ${newRows - oldRows} words.`), `${newRows} words in total.`);
}

module.exports = {
    updateTrends, refreshTrends
};
