'use strict';
const express = require('express');
const debug = require('debug')('backend:count');
const router = express.Router();
const db = require('../database');

/**
 * @api {get} /api/clientCount  Get client count api
 * @apiVersion 0.1.1
 * @apiName GetClientCount
 * @apiGroup Counter
 * @apiPermission everyone
 *
 * @apiDescription This api will return how many users has visited this website (recorded via ip)
 *
 * @apiExample Example usage:
 * curl http://localhost/api/count/clientCount
 *
 * @apiExample Response (example):
 *     {"count": 3}
 */
router.get('/clientCount', async function (req, res) {
    try {
        let count = await db.countTableRows('Clients');
        res.status(200).json({count});
    } catch (err) {
        res.status(500).end();
        debug('Unconfirmed error:', err);
    }
});

/**
 * @api {get} /api/clientCount  Get request count api
 * @apiVersion 0.1.0
 * @apiName GetRequestCount
 * @apiGroup Counter
 * @apiPermission everyone
 *
 * @apiDescription This api will return how many api requests have been responded in total
 *
 * @apiExample Example usage:
 * curl http://localhost/api/count/requestCount
 *
 * @apiExample Response (example):
 *     {"count": 30}
 */
router.get('/requestCount', async function (req, res) {
    try {
        let count = (await db.doSql('SELECT SUM(reqCount) AS count FROM Clients'))[0].count;
        res.status(200).json({count});
    } catch (err) {
        res.status(500).end();
        debug('Unconfirmed error:', err);
    }
});

module.exports = router;
