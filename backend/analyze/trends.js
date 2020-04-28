'use strict';
const ProgressBar = require('progress');
const dateFormat = require('dateformat');
const chalk = require('chalk');
const debug = require('debug')('backend:analyze');
const db = require('../database');
const {preprocessArticles} = require('./word-index');
require('../utils/date');

/**
 * Add trends items within date range into db
 * @param dateMin{Date}
 * @param dateMax{Date}
 * @return {Promise<void>}
 */
async function storeTrendsWithin(dateMin, dateMax) {
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
        if (articles.length === 0) continue;
        preprocessArticles(articles);
        let trends = new Map(); // trends of the day
        for (let article of articles) {
            article.tokens.forEach(stem => {
                let oldVal = trends.get(stem) || 0;
                trends.set(stem, oldVal + article.pagerank);
            });
        }
        // insert into db
        let entries = [];
        for (let [stem, freq] of trends.entries()) {
            entries.push({
                date: lower,
                stem: db.escape(stem),
                freq: db.escape(freq)
            });
        }
        await db.insertEntries('Trends', entries);
    }
}

/**
 * Sum up trends from earliest to latest record
 * language=MySQL
 */
async function updateTrendsSumUp() {
    return db.clearTable('TrendsSumUp')
        .then(() => db.doSql('INSERT INTO TrendsSumUp (stem, freq) SELECT stem, SUM(freq) AS freq FROM Trends GROUP BY stem'));
}

/** Update Trends table incrementally
 * @param dateMin{string}
 * @param dateMax{string}
 * @return {Promise<void>}
 */
async function updateTrends(dateMin = '2020/1/1', dateMax = Date()) {
    debug('Updating Trends table...');
    try {
        var oldRows = await db.countTableRows('Trends');
        dateMin = new Date(dateMin);
        dateMax = new Date(dateMax);
        dateMin = new Date(dateMin.toLocaleDateString());
        dateMax = new Date(dateMax.toLocaleDateString());
        // fetch articles within each day
        await storeTrendsWithin(dateMin, dateMax);
        var newRows = await db.countTableRows('Trends');
        // sum up trends from earliest to latest record
        await updateTrendsSumUp();
    } catch (err) {
        console.error(chalk.red('Error when updating Trends:'), err.message);
        throw err;
    }
    debug('Update Trends success.', chalk.green(`[+] ${newRows - oldRows} words.`), `${newRows} words in total.`);
}

module.exports = {updateTrends};
