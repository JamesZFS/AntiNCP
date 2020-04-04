const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
tokenizer.attach(); // create "string".tokenize() method
natural.PorterStemmer.attach();
const WORD_REG = /^[a-zA-Z]\w*$/;

String.prototype._tokenizeAndStem = String.prototype.tokenizeAndStem;

/**
 * Tokenize a document, stem, filter non-words & stop words
 * @return {string[]}
 */
String.prototype.tokenizeAndStem = function () {
    return this._tokenizeAndStem().filter(x => WORD_REG.test(x));
};
