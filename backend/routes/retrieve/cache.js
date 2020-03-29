'use strict';
const redis = require('redis');
var client;
const red = require('chalk').red;
const debug = require('debug')('backend:retrieve:cache');

/**
 * @return {Promise<void>}
 */
async function initialize() {
    return new Promise(async resolve => {
        client = redis.createClient();
        client.on('connect', () => {
            debug('Redis initialized.');
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
        client.get(key, (err, result) => {
            if (err) {
                debug('Get error:', err.message);
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
        client.set(key, val, (err, reply) => {
            if (err) {
                debug('Set error:', err.message);
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
        client.flushall((err, reply) => {
            if (err) {
                debug('Flush error:', err.message);
                reject(err);
            } else {
                resolve(reply);
            }
        });
    });
}

async function test() {
    debug('test begin');
    await initialize();
    await set('123', 'aa');
    await get('123');
    await flush();
    await get('123');
    debug('test done');
}

module.exports = {initialize, get, set, flush};
