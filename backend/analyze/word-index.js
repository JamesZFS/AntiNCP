'use strict';
const chalk = require('chalk');
const ProgressBar = require('progress');
const debug = require('debug')('backend:analyze');
const db = require('../database');
const tuple = require('../utils/tuple');
const {preprocessArticles} = require('./preprocess'); // register `tokenize`, `stem` & `tokenizeAndStem` method
const ID_STEP = 1000;

// c.r. https://stackoverflow.com/questions/12102200/get-records-with-max-value-for-each-group-of-grouped-sql-results
const STEM_TO_WORD_UPDATE_SQL = `
    INSERT IGNORE INTO Stem2Word (stem, word)
    SELECT a.stem as stem, a.word as word
    FROM WordStem a
             LEFT JOIN WordStem b ON a.stem = b.stem AND a.freq < b.freq
    WHERE b.freq is NULL`;

// clear and rebuild Stem2Word table (this is 100% based on MySQL operations)
async function refreshStem2Word() {
    await db.clearTable('Stem2Word');
    await db.doSql(STEM_TO_WORD_UPDATE_SQL);
}

// update stem-word relationship
async function storeWordStem(articles) {
    let wordStems = new Map(); // (word, stem) -> frequency
    preprocessArticles(articles, (word, stem) => {
        let old = wordStems.get(tuple(word, stem)) || 0;
        wordStems.set(tuple(word, stem), old + 1);
    });
    let entries = []; // [(stem, word, freq)]
    for (let [[word, stem], freq] of wordStems.entries()) {
        entries.push({stem: db.escape(stem), word: db.escape(word), freq});
    }
    await db.insertEntries('WordStem', entries, `ON DUPLICATE KEY UPDATE freq = freq + VALUES(freq)`);
}

// update word-index
async function storeWordIndex(articles) {
    let entries = []; // [(stem, articleId, freq)]
    let wordIndexSumUp = new Map(); // stem -> set(articleId)
    for (let article of articles) {
        let wordsPerArticle = new Map(); // stem -> count
        let total = 0; // total words in an article
        for (let stem of article.tokens) {
            total += 1;
            let old = wordsPerArticle.get(stem) || 0;
            wordsPerArticle.set(stem, old + 1);
            if (wordIndexSumUp.has(stem)) wordIndexSumUp.get(stem).add(article.id);
            else wordIndexSumUp.set(stem, new Set([article.id]));
        }
        for (let [stem, count] of wordsPerArticle.entries()) entries.push({
            stem: db.escape(stem),
            articleId: article.id,
            freq: count / total, // document freq, i.e. tf
        })
    }
    await db.insertEntries('WordIndex', entries); // throw error on duplication
    // const totalArticles = await db.countTableRows('Articles');
    // const oldArticles = totalArticles - articles.length;
    entries = [...wordIndexSumUp.entries()].map(([stem, articeleIds]) => {
        return {
            stem: db.escape(stem),
            count: articeleIds.size,
        }
    });
    await db.insertEntries('WordIndexSumUp', entries, `ON DUPLICATE KEY UPDATE count = count + VALUES(count)`);
}

/** Update WordIndex table & WordStem table incrementally
 * @param idMin{int}
 * @param idMax{int}
 * @return {Promise<void>}
 */
async function updateWordIndex(idMin = 0, idMax = 0) {
    debug('Updating WordIndex/WordStem table...');
    try {
        var oldRows = await db.countTableRows('WordIndex');
        idMin = idMin || (await db.doSql('SELECT MIN(id) AS id FROM Articles'))[0].id;
        idMax = idMax || (await db.doSql('SELECT MAX(id) AS id FROM Articles'))[0].id;
        let bar = new ProgressBar('  computing tf-idf [:bar] :rate/bps :percent :etas', {
            complete: '=',
            incomplete: ' ',
            head: '>',
            width: 20,
            total: idMax - idMin + 1,
        });
        // io with database per bulk
        for (let curId = idMin; curId <= idMax; curId += ID_STEP) {
            let curIdMax = Math.min(curId + ID_STEP - 1, idMax);
            bar.tick(curIdMax - curId + 1);
            let articles = await db.doSql(`SELECT * FROM Articles WHERE id BETWEEN ${curId} AND ${curIdMax}`);
            if (articles.length === 0) continue;
            await storeWordStem(articles); // articles preprocessed here
            // console.assert(articles[0].pagerank !== undefined);
            await storeWordIndex(articles);
        }
        await refreshStem2Word();
        var newRows = await db.countTableRows('WordIndex');
    } catch (err) {
        console.error(chalk.red('Error when updating WordIndex:'), err.message);
        throw err;
    }
    debug('Update WordIndex/WordStem success.', chalk.green(`[+] ${newRows - oldRows} records.`), `${newRows} records in total.`);
}


module.exports = {
    updateWordIndex,
};
