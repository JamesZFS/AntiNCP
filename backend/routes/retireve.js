var express = require('express');
var createError = require('http-errors');
var router = express.Router();
var axios = require('axios');
var apis = require('../config/apis');
var debug = require('debug')('backend:retrieve');
var fs = require('fs');
const epidemicData = JSON.parse(fs.readFileSync('public/data/epidemic.aminer.json'));

// Retrieve middleware
router.use('/epidemic', function (req, res, next) {
    res.attached = epidemicData.data;
    next();
    // axios.get(apis.AMINER_EPIDEMIC_API)
    //     .then(response => {
    //         res.attached = response.data.data;
    //         next();
    //     })
    //     .catch(error => {
    //         res.status(404).end();
    //         debug(error)
    //     });
});

/**
 * @api {get} /retrieve/epidemic/China  Get epidemic China api
 * @apiVersion 0.1.0
 * @apiName GetEpidemicChina
 * @apiGroup Retrieve
 * @apiPermission everyone
 *
 * @apiDescription Retrieve overall epidemic data in China
 *
 * @apiSuccess {Object}  . json epidemic data
 *
 * @apiExample Response (example):
 *  HTTP/1.1 200 OK
 *     {
 *         "currentConfirmedCount": 27524,
 *         "confirmedCount": 80422,
 *         "suspectedCount": 520,
 *         "curedCount": 49914,
 *         "deadCount": 2984,
 *         "seriousCount": 6416,
 *         "suspectedIncr": 143,
 *         "currentConfirmedIncr": -2572,
 *         "confirmedIncr": 120,
 *         "curedIncr": 2654,
 *         "deadIncr": 38,
 *         "seriousIncr": -390
 *     }
 */
router.get('/epidemic/China', function (req, res) {
    let data = res.attached.overall;
    if (data === undefined) {
        res.status(404).end();
        return
    }
    res.status(200).send({
        currentConfirmedCount: data.currentConfirmedCount,
        confirmedCount: data.confirmedCount,
        suspectedCount: data.suspectedCount,
        curedCount: data.curedCount,
        deadCount: data.deadCount,
        seriousCount: data.seriousCount,
        suspectedIncr: data.suspectedIncr,
        currentConfirmedIncr: data.currentConfirmedIncr,
        confirmedIncr: data.confirmedIncr,
        curedIncr: data.curedIncr,
        deadIncr: data.deadIncr,
        seriousIncr: data.seriousIncr,
    });
});

/**
 * @api {get} /retrieve/epidemic/province  Get epidemic province api
 * @apiVersion 0.1.0
 * @apiName GetEpidemicProvince
 * @apiGroup Retrieve
 * @apiPermission everyone
 *
 * @apiDescription Retrieve epidemic data in a specific province
 *
 * @apiParam (Query Param) {string}  q  province name
 *
 * @apiSuccess {Object}  . array of epidemic data in different cities
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/retrieve/epidemic/province?p=四川省
 *
 * @apiExample Response (example):
 *  HTTP/1.1 200 OK
 *     [
 *         {
 *             "cityName": "成都",
 *             "currentConfirmedCount": 47,
 *             "confirmedCount": 143,
 *             "suspectedCount": 0,
 *             "curedCount": 93,
 *             "deadCount": 3,
 *             "locationId": 510100,
 *             "confirmedAddCount": 0,
 *             "suspectedAddCount": 0,
 *             "curedAddCount": 1,
 *             "deadAddCount": 0
 *         },
 *         {
 *             "cityName": "甘孜州",
 *             "currentConfirmedCount": 25,
 *             "confirmedCount": 78,
 *             "suspectedCount": 0,
 *             "curedCount": 53,
 *             "deadCount": 0,
 *             "locationId": 513300,
 *             "confirmedAddCount": 0,
 *             "suspectedAddCount": 0,
 *             "curedAddCount": 6,
 *             "deadAddCount": 0
 *         },
 *       ...
 *     ]
 */
router.get('/epidemic/province', function (req, res, next) {
    let provinceName = req.query.p;
    debug(provinceName);
    if (provinceName === undefined) {
        next(createError(400));
        return
    }
    debug(`provinceName = ${provinceName}`);
    let province = res.attached.area.find(val => val.provinceName === provinceName);
    debug(`found province ${province}`);
    if (province === undefined) {
        res.status(404).send({cause: "Province not found."});
        return
    }
    res.status(200).send(province.cities);

}, function (err, req, res, next) {
    res.locals.message = `Wrong use of api.   Usage: ${req.path}?p=(province name)`;
    res.status(err.status).render('error', { error: err });
});


/**
 * @api {get} /retrieve/test Test api
 * @apiVersion 0.1.0
 * @apiName GetTest
 * @apiGroup Retrieve
 * @apiPermission everyone
 *
 * @apiDescription A test api
 *
 * @apiExample Example usage:
 * curl -i http://localhost:3000/retrieve
 *
 * @apiSuccess {String}   result    "ok!"
 *
 * @apiExample Response (example):
 *  HTTP/1.1 200 OK
 *     {
 *       "result": "ok!"
 *     }
 */
router.get('/test', function (req, res) {
    res.status(200)
        .send({
            result: "ok!"
        });
});

module.exports = router;
