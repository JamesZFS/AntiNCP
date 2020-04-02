// The sources are credit to the open source project [COVID-19 Bot](https://github.com/the-robot/covid19-updates)

// News Sources
const NEWS_RSS = {
    bbc: {
        short: 'BBC',
        name: 'British Broadcasting Corporation',
        url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    },
    cna: {
        short: 'CNA',
        name: 'Channel News Asia',
        url: 'https://www.channelnewsasia.com/rssfeeds/8395986'
    },
    cnbc: {
        short: 'CNBC',
        name: 'Consumer News and Business Channel',
        url: 'https://www.cnbc.com/id/100727362/device/rss/rss.html',
    },
    cnn: {
        short: 'CNN',
        name: 'Cable News Network',
        url: 'http://rss.cnn.com/rss/edition.rss',
    },
    guardian: {
        short: 'The Guardian',
        name: 'The Guardian',
        url: 'https://www.theguardian.com/world/rss'
    },
//   mail_online: {
//     short: 'Mail Online',
//     name: 'Mail Online',
//     url: 'https://www.dailymail.co.uk/articles.rss',
//   },
    ny_times: {
        short: 'New York Times',
        name: 'New York Times',
        url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    },
    rfa: {
        short: 'RFA',
        name: 'Radio Free Asia',
        url: 'https://www.rfa.org/english/feed/rss2.xml',
    },
    strait_times: {
        short: 'Strait Times',
        name: 'Strait Times',
        url: 'https://www.straitstimes.com/news/asia/rss.xml'
    },
    the_independent: {
        short: 'The Independent',
        name: 'The Independent',
        url: 'http://www.independent.co.uk/news/world/rss',
    },
    yahoo: {
        short: 'Yahoo Singapore',
        name: 'Yahoo Singapore',
        url: 'https://sg.news.yahoo.com/rss/'
    },
};

// Reddit RSS
const REDDIT_RSS = {
    china: {
        short: 'r/china',
        name: 'China',
        url: 'https://www.reddit.com/r/China/.rss',
    },
    china_flu: {
        short: 'r/china_flu',
        name: 'China Flu',
        url: 'https://www.reddit.com/r/china_flu/.rss',
    },
    coronavirus: {
        short: 'r/coronavirus',
        name: 'Coronavirus',
        url: 'https://www.reddit.com/r/coronavirus/.rss',
    },
    news: {
        short: 'r/news',
        name: 'Reddit News',
        url: 'https://www.reddit.com/r/news/.rss',
    },
    singapore: {
        short: 'r/singapore',
        name: 'Singapore',
        url: 'https://www.reddit.com/r/singapore/.rss',
    },
};

// Twitter username
const TWITTER_RSS = {
    wuhanvirus: {
        short: '@thewuhanvirus',
        name: 'The Wuhan Virus',
        url: 'https://twitrss.me/twitter_user_to_rss/?user=thewuhanvirus',
    },
    trump: {
        short: '@realDonaldTrump',
        name: 'Donald Trump',
        url: 'https://twitrss.me/twitter_user_to_rss/?user=realDonaldTrump'
    }
};

const ALL = {};
Object.assign(ALL, NEWS_RSS, REDDIT_RSS, TWITTER_RSS);

module.exports = {NEWS_RSS, REDDIT_RSS, TWITTER_RSS, ALL};
