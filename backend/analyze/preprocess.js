const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
tokenizer.attach(); // create "string".tokenize() method
natural.PorterStemmer.attach();
// const WORD_REG = /^[a-zA-Z]\w*$/; // todo: discuss
const WORD_REG = /^[a-zA-Z]+$/;

natural.stopwords = new Set(natural.stopwords.concat(['www', 'http', 'https', 'com', 'co', 'span', 'link', 'submitted', 'comments', 'will', 'not', 'div']));

/**
 * Tokenize a document, stem, filter non-words & stop words
 * @return {string[]}
 */
String.prototype.tokenizeAndStem = function () {
    return this.tokenize()
        .filter(x => 2 <= x.length && x.length <= 30 && WORD_REG.test(x) && !natural.stopwords.has(x))
        .map(x => x.toLowerCase().stem().toString());
};
