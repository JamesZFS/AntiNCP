// Data analysis module
'use strict';

const {updateWordIndex, refreshWordIndex} = require('./word-index');
const {updateTrends, refreshTrends} = require('./trends');

module.exports = {updateTrends, refreshTrends, updateWordIndex, refreshWordIndex};
