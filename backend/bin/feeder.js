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
        await fetcher.pingFlask();
        if (process.argv.indexOf('--download') >= 0) {
            await fetcher.fetchAll();
        }
        if (process.argv.indexOf('--refetch') >= 0) {
            await fetcher.reFetchEpidemicData();
        }
        if (process.argv.indexOf('--rebuild') >= 0) { // rebuild all index tables from Articles
            await analyzer.refreshTrends();
            await analyzer.refreshWordIndex();
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
