/**
 * Data fetcher & analyzer
 * Should be able to access the mysql-server and redis-server of the machine that runs `www`
 * Should be started in a **proxychains4** presented environment
 */

const chalk = require('chalk');
const debug = require('debug')('backend:Feeder');
const fetcher = require('../fetch');
const db = require('../database');
const cache = require('../routes/retrieve/cache');
const analyzer = require('../analyze');

async function launch() {
    // Connect to mysql and redis where `www` runs
    debug('Initializing...');
    try {
        await db.initialize();
        await cache.initialize();
        if (process.argv.indexOf('--download') >= 0) {
            await Promise.all([fetcher.downloadEpidemicData(), fetcher.fetchVirusArticles()]);
        }
        if (process.argv.indexOf('--reload') >= 0) {
            await fetcher.reloadEpidemicData();
        }
        if (process.argv.indexOf('--rebuild') >= 0) { // rebuild all index tables
            await Promise.all([db.clearTable('WordStem'), db.clearTable('WordIndex'), db.clearTable('Trends')]);
            await Promise.all([analyzer.updateWordIndex(), analyzer.updateTrends()]);
        }
        await fetcher.initialize(); // scheduler
    } catch (err) {
        console.error(chalk.red('Caught fatal error in feeder!'));
        console.error(err);
        await db.finalize();
        process.exit(1);
    }
    debug('Initialize finished. Waiting for the next schedule...');
}

launch();
