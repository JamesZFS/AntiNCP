// Part of this code is credit to the open source project [COVID-19 Bot](https://github.com/the-robot/covid19-updates)
'use strict';
const debug = require('debug')('backend:fetch:rss');
const rssParser = require('rss-parser');
const dateFormat = require('dateformat');
const chalk = require('chalk');
const utf8 = require('utf8');
const fs = require('fs');
const stripHtml = require("string-strip-html");
const escape = require('../database').escape;
const wget = require('../utils/wget');
const TEMP_XML = 'tmp.xml';
const {IS_ABOUT_VIRUS_REG, URL_REG, WGET_TIMEOUT} = require('./config');

/**
 * Get articles from rss sources
 * @param rssSources{object[]|Object} should look like stuffs in '../config/third-party/rss'
 * @param filter{callback|undefined}   if given, return only articles whose title or link match the filter
 * @param map{callback|undefined}   if given, will map an article object to another object, if throwing error, skip the article
 * @return {Promise<Object[]>}
 */
async function getArticlesFromRss(rssSources, filter, map) {
    const articles = [];
    // rss parser
    const parser = new rssParser();
    for (let [_idx, source] of Object.entries(rssSources)) {
        debug(`Fetching articles from '${source.name}'`);
        try {
            // proxy download with wget
            await wget(source.url, TEMP_XML, true, {timeout: WGET_TIMEOUT});
            let feeds = await parser.parseString(fs.readFileSync(TEMP_XML).toString());
            feeds.items.forEach(item => {
                if (!filter || filter(item.title) || filter(item.link) || filter(item.content)) {
                    item.articleSource = {
                        short: source.short,
                        name: source.name
                    };
                    if (map) {
                        try {
                            articles.push(map(item));
                        } catch (err) {
                            debug(`Error when parsing article '${item.link}' from source '${source.short}': ${err.message}`);
                        }
                    } else {
                        articles.push(item);
                    }
                }
            });
        } catch (err) {
            console.error(chalk.red('Get rss feeds failed:'), err.message);
        }
    }
    return articles;
}

/**
 * Check if the text is about wuhan/corona virus
 * @param text{string}
 * @return {boolean}
 */
function isAboutVirus(text) {
    return IS_ABOUT_VIRUS_REG.test(text);
}

/**
 * Convert an rss article into an escaped db entry
 * @param article{Object}
 * @return {{date: *, creator: *, articleSource: string, link: *, title: *, content: *}}
 */
function article2Entry(article) {
    let result = {
        date: dateFormat(article['date'] || article['pubDate'] || article['dc:date'] || new Date(), 'yyyy-mm-dd HH:MM:ss'),
        title: stripHtml(article['title']).replace(URL_REG, '').slice(0, 1010), // slice to avoid length overflow
        link: (article['link'] || article['guid']).slice(0, 2070),
        creator: (article['creator'] || article['author'] || article['dc:creator'] || article.articleSource.name).slice(0, 500),
        content: stripHtml(article['content'] || article['contentSnippet'] || article['description'] || article['title']).replace(URL_REG, ''),
        sourceName: article.articleSource.name.slice(0, 500),
        sourceShort: article.articleSource.short.slice(0, 500)
    };
    let missingColumns = Object.entries(result).filter(([_k, val]) => !val);
    if (missingColumns.length > 0) throw new Error(`Columns ${chalk.red(missingColumns.toString())} missing.`);
    for (let key in result) result[key] = escape(utf8.encode(result[key])); // re-encode & escape
    return result;
}

module.exports = { getArticlesFromRss, isAboutVirus, article2Entry };
