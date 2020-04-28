const natural = require('natural');
const {getPageRank} = require('../fetch/third-party/articles');
const tokenizer = new natural.WordTokenizer();
tokenizer.attach(); // create "string".tokenize() method
natural.PorterStemmer.attach();
const WORD_REG = /^[a-zA-Z]+$/;

natural.stopwords = new Set(natural.stopwords.concat(['the', 'on', 'www',
    'http', 'https', 'com', 'co', 'span', 'link', 'submitted', 'comments',
    'will', 'not', 'div', 'pic'
]));

/**
 * Tokenize a document, stem, filter non-words & stop words
 * @param cb{function(string, string)} callback on stemming a word, e.g. to document the word-stem pair in db
 * @return {string[]}
 */
String.prototype.tokenizeAndStem = function (cb) {
    return this.tokenize()
        .filter(x => 2 <= x.length && x.length <= 30 &&
            WORD_REG.test(x) && !natural.stopwords.has(x.toLowerCase()))
        .map(word => {
            let stem = word.toLowerCase().stem().toString();
            if (cb) cb(word, stem);
            return stem;
        });
};

/**
 * Preprocess articles into stemmed tokens **in place**
 * @param articles{Object[]}
 * @param cb{function(string, string)} callback on stemming a word, e.g. to document the word-stem pair in db
 * @return {Object[]}
 */
function preprocessArticles(articles, cb = null) {
    articles.forEach(article => {
        article.tokens = article.title.tokenizeAndStem(cb)
            .concat(article.content.tokenizeAndStem(cb));
        article.pagerank = getPageRank(article.sourceName);
    });
    return articles;
}

module.exports = {preprocessArticles};
