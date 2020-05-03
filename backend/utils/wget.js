const childProcess = require('child_process');
const chalk = require('chalk');
const debug = require('debug')('backend:utils:wget');
const scheduler = require('./scheduler');

const {HTTP_PROXY_PORT, WGET_TIMEOUT} = require('./config');
const env = `http_proxy=http://127.0.0.1:${HTTP_PROXY_PORT} https_proxy=http://127.0.0.1:${HTTP_PROXY_PORT}`;

// when using proxy mode, make sure privoxy server is running
async function _wget(url, file, proxy, options) {
    return new Promise(
        (resolve, reject) =>
            childProcess.exec(`${proxy ? env : ''} wget ${url} -O ${file}`, options, (err, stdout, _stderr) => {
                if (err) reject(err);
                resolve(stdout);
            }));
}

// when using proxy mode, make sure privoxy server is running
async function wget(url, filePath, proxy = false, retry = false) {
    if (retry) {
        let trial = scheduler.fetchingPolicy.maxTrials;
        while (true) {
            try {
                await _wget(url, filePath, proxy, {timeout: WGET_TIMEOUT});
            } catch (err) {
                debug(`Fail to downlaod from ${url}, retry in ${scheduler.fetchingPolicy.interval / 60000} mins.`);
                if (--trial > 0) {
                    await scheduler.sleep(scheduler.fetchingPolicy.interval);
                    continue;
                } else {  // give up
                    console.error(chalk.red('Fail to download from csv epidemic source. Skip this download.'), err.message);
                    throw err;
                }
            }
            break; // success
        }
    } else {
        return _wget(url, filePath, proxy, {timeout: WGET_TIMEOUT});
    }
}

module.exports = wget;
