'use strict';
const ProgressBar = require('progress');
const dateFormat = require('dateformat');
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
        preprocessArticles(articles);
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
}

module.exports = {storeTrendsWithin};
