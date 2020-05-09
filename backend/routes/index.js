'use strict';
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'AntiNCP Backend', content: 'See our `/doc` for api usage.'});
});

router.use('/retrieve', require('./retrieve'));

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
