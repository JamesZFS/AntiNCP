'use strict';
const chalk = require('chalk');
const debug = require('debug')('backend:analyze:word-index');
const ProgressBar = require('progress');
const db = require('../database');
const natural = require('natural');
const getPageRank = require('../config/third-party/articles').getPageRank;
require('./preprocess');


/**
 * Create wordIndex whose value is tfidf in all documents
 * @param articles{Object[]} should contain `id` and (stemmed) `tokens`{string[]} field
 * @return {Map<string, Map<int, number>>} maps a stemmed word to a map that maps an article id to the rank value
 */
function createWordIndex_tfidf(articles) {
    let tfidf = new natural.TfIdf();
    let wordIndex = new Map();
    for (let article of articles) {
        article.tokens.forEach(token => {
            if (!wordIndex.has(token)) wordIndex.set(token, new Map());  // new word
        });
        tfidf.addDocument(article.tokens);
    }
    let bar = new ProgressBar('  computing tfidfs [:bar] :rate/bps :percent :etas', {
        complete: '=',
        incomplete: ' ',
        head: '>',
        width: 20,
        total: wordIndex.size
    });
    for (let [word, occurrences] of wordIndex.entries()) {
        bar.tick();
        tfidf.tfidfs(word, (i, measure) => {
            if (measure <= 0) return;
            occurrences.set(articles[i].id, measure);
        });
    }
    return wordIndex;
}

/**
 * Create wordIndex whose value is tf * pagerank in all documents
 * @param articles{Object[]} should contain `id` and (stemmed) `tokens`{string[]} and `pagerank` field
 * @param warmStart{undefined|Map<string, Map<int, number>>} initial wordIndex
 * @return {Map<string, Map<int, number>>} maps a stemmed word to a map that maps an article id to the rank value
 */
function createWordIndex_pagerank(articles, warmStart) {
    var wordIndex = warmStart || new Map();
    let bar = new ProgressBar('  building wordIndex [:bar] :rate/bps :percent :etas', {
        complete: '=',
        incomplete: ' ',
        head: '>',
        width: 20,
        total: articles.length
    });
    for (let article of articles) {
        bar.tick();
        article.tokens.forEach(token => {
            let occurrences = wordIndex.get(token);
            if (occurrences === undefined)
                wordIndex.set(token, new Map([[article.id, article.pagerank]]));
            else {
                let oldVal = occurrences.get(article.id) || 0;
                occurrences.set(article.id, oldVal + article.pagerank);
            }
        });
    }
    return wordIndex;
}

async function main() {
    await db.initialize();
    let articles = await db.selectArticles('*');
    console.log('length:', articles.length);
    articles.forEach(article => {
        article.tokens = article.title.tokenizeAndStem().concat(article.content.tokenizeAndStem());
        article.pagerank = getPageRank(article.sourceName);
    });
    let wordIndex = createWordIndex_pagerank(articles);
    // console.log(wordIndex);
    await db.clearTable('WordIndex');
    await storeWordIndex(wordIndex);
    let rows = await db.countTableRows('WordIndex');
    console.log(chalk.green(`[+] ${rows} rows`));

    process.exit(0);
}

Map.prototype.serialize = function (...args) {
    return JSON.stringify([...this.entries()], ...args);
};

function deserialize(str) {
    return JSON.parse(str).reduce((m, [key, val]) => m.set(key, val), new Map());
}

/**
 * Store the wordIndex to db
 * @param wordIndex{Map<string, Map<int, number>>}
 */
async function storeWordIndex(wordIndex) {
    let entries = [];
    for (let [word, occurrences] of wordIndex.entries()) {
        entries.push({
            word: db.escape(word),
            occurrences: db.escape(occurrences.serialize())
        });
    }
    await db.insertEntries('WordIndex', entries);
}

/**
 * Load the wordIndex from db
 * @return {Map<string, Map<int, number>>}
 */
async function loadWordIndex() {
    let res = await db.selectInTable('WordIndex', ['word', 'occurrences']);
    let wordIndex = new Map();
    res.forEach(item => wordIndex.set(item.word, deserialize(item.occurrences)));
    return wordIndex;
}


main().catch(err => {
    console.error(err);
    process.exit(1);
});
