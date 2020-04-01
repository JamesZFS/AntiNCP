// Part of this code is credit to the open source project [COVID-19 Bot](https://github.com/the-robot/covid19-updates)
'use strict';
const debug = require('debug')('backend:fetch:rss');
const rssParser = require('rss-parser');
const chalk = require('chalk');
const fs = require('fs');
const IS_ABOUT_VIRUS_REG = /wuhan|corona|virus|covid/ig.compile(); // i - ignore capitalization, g - global

/**
 * Get articles from rss sources
 * @param rssSources{object[]|Object} should look like stuffs in '../config/third-party/rss'
 * @param filter{callback|null}   if given, return only articles whose title or link match the filter
 * @param tryHarder{boolean}      if true, will try filtering the content
 * @return {Promise<Object[]>}
 */
async function getArticlesFromRss(rssSources, filter, tryHarder = false) {
    const articles = [];
    // rss parser
    const parser = new rssParser();

    for (let index in rssSources) {
        let source = rssSources[index];
        debug(`Fetching articles from ${source.name}`);
        try {
            let feeds = await parser.parseURL(source.url);
            feeds.items.forEach(item => {
                if (!filter || filter(item.title) || filter(item.link) || (tryHarder && filter(item.content))) {
                    item.articleSource = {
                        short: source.short,
                        name: source.name
                    };
                    articles.push(item);
                }
            });
            debug(chalk.green('Done.'));
        } catch (err) {
            console.error(chalk.red('Get rss feeds failed:'), err.message);
        }
    }
    return articles;
}

function isAboutVirus(text) {
    // to check if the text is about wuhan/corona virus
    return IS_ABOUT_VIRUS_REG.test(text);
}

const sources = require('../config/third-party/rss').TWITTER_RSS;
getArticlesFromRss(sources, isAboutVirus).then(articles => {
    debug('All done.');
    fs.writeFileSync('../public/data/rss/Twitter-4-1.txt', JSON.stringify(articles, null, 4));
}).catch(err => {
    console.error('Failed.', chalk.red(err.message));
});

module.exports = {rssParser};
