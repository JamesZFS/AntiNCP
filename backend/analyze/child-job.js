// This module is executed in the child process
'use strict';
const debug = require('debug')('backend:analyze:child');
const analyzer = require('./index');
const db = require('../database');

debug('Subprocess started.');

db.initialize().then(async () => {
    try {
        await analyzer.refreshWordIndex();
        await analyzer.refreshTrends();
    } catch (err) {
        return Promise.reject(err);
    }
    debug('Subprocess success.');
    process.exit(0);
}).catch(err => {
    debug('Subprocess failed.', err.message);
    process.exit(1);
});
