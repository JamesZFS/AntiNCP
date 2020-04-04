const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
tokenizer.attach(); // create "string".tokenize() method
natural.PorterStemmer.attach();
// const WORD_REG = /^[a-zA-Z]\w*$/; // todo: discuss
const WORD_REG = /^[a-zA-Z]+$/;

// natural.stopwords = natural.stopwords.concat([
//     'com', 'http', 'href', 'www', 'span', 'td', 'src', 'class', 'link', 'img', 'br', 'alt',
//     'tr', 'js', 'will', 'li', 'emoji', 'dir', 'jpg', 'jpeg', 'not']);

String.prototype._tokenizeAndStem = String.prototype.tokenizeAndStem;

/**
 * Tokenize a document, stem, filter non-words & stop words
 * @return {string[]}
 */
String.prototype.tokenizeAndStem = function () {
    return this._tokenizeAndStem().filter(x => 2 <= x.length && x.length <= 30 && WORD_REG.test(x));
};
