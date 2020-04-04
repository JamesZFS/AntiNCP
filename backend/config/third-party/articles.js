// The sources are credit to the open source project [COVID-19 Bot](https://github.com/the-robot/covid19-updates)
// PageRank credit to https://www.domcop.com/openpagerank/

// News Sources
const NEWS_RSS = {
    bbc: {
        short: 'BBC',
        name: 'British Broadcasting Corporation',
        url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
        pagerank: 7.64,
    },
    cna: {
        short: 'CNA',
        name: 'Channel News Asia',
        url: 'https://www.channelnewsasia.com/rssfeeds/8395986',
        pagerank: 5.32,
    },
    cnbc: {
        short: 'CNBC',
        name: 'Consumer News and Business Channel',
        url: 'https://www.cnbc.com/id/100727362/device/rss/rss.html',
        pagerank: 7.44,
    },
    cnn: {
        short: 'CNN',
        name: 'Cable News Network',
        url: 'http://rss.cnn.com/rss/edition.rss',
        pagerank: 7.83,
    },
    guardian: {
        short: 'The Guardian',
        name: 'The Guardian',
        url: 'https://www.theguardian.com/world/rss',
        pagerank: 8.03,
    },
    ny_times: {
        short: 'New York Times',
        name: 'New York Times',
        url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        pagerank: 8.13,
    },
    rfa: {
        short: 'RFA',
        name: 'Radio Free Asia',
        url: 'https://www.rfa.org/english/feed/rss2.xml',
        pagerank: 6.11,
    },
    strait_times: {
        short: 'Strait Times',
        name: 'Strait Times',
        url: 'https://www.straitstimes.com/news/asia/rss.xml',
        pagerank: 5.63,
    },
    the_independent: {
        short: 'The Independent',
        name: 'The Independent',
        url: 'http://www.independent.co.uk/news/world/rss',
        pagerank: 7.37,
    },
    yahoo: {
        short: 'Yahoo Singapore',
        name: 'Yahoo Singapore',
        url: 'https://sg.news.yahoo.com/rss/',
        pagerank: 5.09,
    },
};

// Reddit RSS
const REDDIT_RSS = {
    china: {
        short: 'r/china',
        name: 'Reddit China',
        url: 'https://www.reddit.com/r/China/.rss',
        pagerank: 8.33,
    },
    china_flu: {
        short: 'r/china_flu',
        name: 'Reddit China Flu',
        url: 'https://www.reddit.com/r/china_flu/.rss',
        pagerank: 8.33,
    },
    coronavirus: {
        short: 'r/coronavirus',
        name: 'Reddit Coronavirus',
        url: 'https://www.reddit.com/r/coronavirus/.rss',
        pagerank: 8.33,
    },
    news: {
        short: 'r/news',
        name: 'Reddit News',
        url: 'https://www.reddit.com/r/news/.rss',
        pagerank: 8.33,
    },
    singapore: {
        short: 'r/singapore',
        name: 'Reddit Singapore',
        url: 'https://www.reddit.com/r/singapore/.rss',
        pagerank: 8.33,
    },
};

// Twitter username
const TWITTER_RSS = {
    wuhanvirus: {
        short: '@thewuhanvirus',
        name: 'Twitter The Wuhan Virus',
        url: 'https://twitrss.me/twitter_user_to_rss/?user=thewuhanvirus',
        pagerank: 10,
    },
    trump: {
        short: '@realDonaldTrump',
        name: 'Twitter Donald Trump',
        url: 'https://twitrss.me/twitter_user_to_rss/?user=realDonaldTrump',
        pagerank: 10,
    },
    boris: {
        short: '@BorisJohnson',
        name: 'Twitter Boris Johnson',
        url: 'https://twitrss.me/twitter_user_to_rss/?user=BorisJohnson',
        pagerank: 10,
    },
    covid19app: {
        short: '@COVID2019app',
        name: 'Twitter COVID2019app.live',
        url: 'https://twitrss.me/twitter_user_to_rss/?user=COVID2019app',
        pagerank: 10,
    },
    afp: {
        short: '@AFP',
        name: 'Twitter AFP news agency',
        url: 'https://twitrss.me/twitter_user_to_rss/?user=AFP',
        pagerank: 10,
    }
};

const ALL = {};
Object.assign(ALL, NEWS_RSS, REDDIT_RSS, TWITTER_RSS);

const _pagerank = new Map(); // map name to pagerank

Object.values(ALL).forEach(x => _pagerank.set(x.name, x.pagerank));

function getPageRank(sourceName) {
    let res = _pagerank.get(sourceName);
    if (res === undefined) throw Error(`rss source with name '${sourceName}' doesn't exists!`);
    return res;
}

module.exports = {NEWS_RSS, REDDIT_RSS, TWITTER_RSS, ALL, getPageRank};
