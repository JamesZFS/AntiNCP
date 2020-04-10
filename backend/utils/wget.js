const childProcess = require('child_process');

const {HTTP_PROXY_PORT} = require('./config');
const env = `http_proxy=http://127.0.0.1:${HTTP_PROXY_PORT} https_proxy=http://127.0.0.1:${HTTP_PROXY_PORT}`;

// when using proxy mode, make sure privoxy server is running
async function wget(url, file, proxy = false, options = null) {
    return new Promise(
        (resolve, reject) =>
        childProcess.exec(`${proxy ? env : ''} wget ${url} -O ${file}`, options, (err, stdout, stderr) => {
            if (err) reject(err);
            resolve(stdout);
        }));
}

module.exports = wget;
