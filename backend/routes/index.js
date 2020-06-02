'use strict';
const express = require('express');
const router = express.Router();
const port = require('../app/port');
const axios = require('axios');
const {TOPIC_NAME_API} = require('../fetch/config');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: `AntiNCP Backend (port=${port})`, content: 'See our `/doc` for api usage.'});
});

router.use('/retrieve', require('./retrieve'));

/**
 * @api {get} /api/topicNames Get article topic names
 * @apiVersion 0.1.0
 * @apiName GetTopicNames
 * @apiGroup Articles
 * @apiPermission everyone
 *
 * @apiDescription Get article topic names
 *
 * @apiExample Example usage:
 * curl http://localhost/api/topicNames
 *
 * @apiExample Response (example):
 {
    "topic_names": ["china", "us", ...]
 }
 * @apiSampleRequest /api/topicNames
 */
router.get('/topicNames', async function (req, res) {
    res.status(200).send((await axios.get(TOPIC_NAME_API)).data)
});

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
 * curl http://localhost/api/test
 *
 * @apiSuccess {String}   result    "ok!"
 *
 * @apiExample Response (example):
 *     "OK!"
 */
router.get('/test', function (req, res) {
    res.status(200).send("OK!");
});


router.use('/count', require('./count'));

module.exports = router;
