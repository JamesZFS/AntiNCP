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


async function launch() {
    // Connect to mysql and redis where `www` runs
    debug('Initializing...');
    try {
        await db.initialize();
        await cache.initialize();
        if (process.argv.indexOf('--download') >= 0) await fetcher.downloadEpidemicData();
        if (process.argv.indexOf('--reload') >= 0) await fetcher.reloadEpidemicData();
        await fetcher.initialize();
    } catch (err) {
        console.error(chalk.red('Caught fatal error in feeder!'));
        console.error(err);
        await db.finalize();
        process.exit(1);
    }
    debug('Initialize finished. Waiting for the next schedule...');
}

launch();
