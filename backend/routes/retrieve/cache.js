'use strict';
const redis = require('redis');
const red = require('chalk').red;
const debug = require('debug')('backend:retrieve:cache');
const host = process.env.REMOTE_DB ? require('../../database/config').TENCENT_MYSQL_CFG.host : 'localhost';
const scheduler = require('../../scheduler');
var client;

/**
 * @return {Promise<void>}
 */
async function initialize() {
    return new Promise(async resolve => {
        debug(`Connecting to ${host}:6379`);
        client = redis.createClient({host: host});
        client.on('connect', () => {
            debug('Redis connected.');
            resolve();
        });
        client.on('error', err => {
            console.log('Cache error:', red(err.message));
        });
    });
}

/**
 * @param key{string}
 * @return {Promise<string>}
 */
async function get(key) {
    return new Promise((resolve, reject) => {
        client.get(key, async (err, result) => {
            if (err) {
                debug('Get error:', err.message);
                if (err.code === 'ETIMEDOUT') { // retry in 1 sec
                    await scheduler.sleep(1000);
                    get().then(resolve).catch(reject);
                    return;
                }
                reject(err);
            } else {
                resolve(result);
            }
        })
    });
}

/**
 * @param key{string}
 * @param val{string}
 * @return {Promise<string>}
 */
async function set(key, val) {
    return new Promise((resolve, reject) => {
        client.set(key, val, async (err, reply) => {
            if (err) {
                debug('Set error:', err.message);
                if (err.code === 'ETIMEDOUT') { // retry in 1 sec
                    await scheduler.sleep(1000);
                    set().then(resolve).catch(reject);
                    return;
                }
                reject(err);
            } else {
                resolve(reply);
            }
        })
    });
}

/**
 * @return {Promise<string>}
 */
async function flush() {
    return new Promise((resolve, reject) => {
        client.flushall(async (err, reply) => {
            if (err) {
                debug('Flush error:', err.message);
                if (err.code === 'ETIMEDOUT') { // retry in 1 sec
                    await scheduler.sleep(1000);
                    flush().then(resolve).catch(reject);
                    return;
                }
                reject(err);
            } else {
                debug('Flushed.');
                resolve(reply);
            }
        });
    });
}


module.exports = {initialize, get, set, flush};
