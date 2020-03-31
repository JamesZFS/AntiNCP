const express = require('express');
const debug = require('debug')('backend:index');
const router = express.Router();
const retrieveRouter = require('./retrieve/retrieve');
const db = require('../database/db-manager');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'AntiNCP Backend', content: 'See our `/doc` for api usage.'});
});

router.use('/retrieve', retrieveRouter);

/**
 * @api {get} /api/test Test api
 * @apiVersion 0.1.1
 * @apiName GetTest
 * @apiGroup Test
 * @apiPermission everyone
 *
 * @apiDescription A test api
 *
 * @apiExample Example usage:
 * curl http://localhost:3000/api/test
 *
 * @apiSuccess {String}   result    "ok!"
 *
 * @apiExample Response (example):
 *     "OK!"
 */
router.get('/test', function (req, res) {
    res.status(200).send("OK!");
});

/**
 * @api {get} /api/clientCount  Get client count api
 * @apiVersion 0.1.0
 * @apiName GetClientCount
 * @apiGroup MetaData
 * @apiPermission everyone
 *
 * @apiDescription This api will return how many users has visited this website (recorded via ip)
 *
 * @apiExample Example usage:
 * curl http://localhost:3000/api/clientCount
 *
 * @apiSuccess {String}   Stringified number of client count
 *
 * @apiExample Response (example):
 *     "3"
 */
router.get('/clientCount', async function (req, res) {
    try {
        let count = await db.countTableRows('Clients');
        res.status(200).send(count.toString());
    } catch (err) {
        res.status(500).end();
        debug('Unconfirmed error:', err);
    }
});

module.exports = router;
