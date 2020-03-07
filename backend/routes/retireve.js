var express = require('express');
var createError = require('http-errors');
var router = express.Router();
var axios = require('axios');
var apis = require('../config/apis');
var debug = require('debug')('backend:retrieve');
var fs = require('fs');
// const cacheFilePath = 'public/data/epidemic.aminer.json';
const cacheFilePath = 'public/data/demo-response.json';
var demoData = JSON.parse(fs.readFileSync(cacheFilePath)); // cached data
var epidemicData;
// // todo init epidemic data, #1
// try {
//     epidemicData = JSON.parse(fs.readFileSync(cacheFilePath));
// } catch (err) {
//     console.error("Can't read from cache file.", err);
//     acquireEpidemicData().then(val => {
//         epidemicData = val;
//         fs.writeFileSync(cacheFilePath, JSON.stringify(epidemicData));
//         debug("Epidemic data updated.");
//     }).catch(err => {
//         console.error("Fatal: fail to update from epidemic data source.");
//         process.exit(1);
//     });
// }
//
// // todo
// function acquireEpidemicData() { // async
//     debug(`Acquiring epidemic data from source ${apis.AMINER_EPIDEMIC_API}`);
//     return new Promise(function (resolve, reject) {
//         axios.get(apis.AMINER_EPIDEMIC_API)
//             .then(response => {
//                 response.data.updateTime = Date.now();
//                 resolve(response.data);
//             })
//             .catch(error => {
//                 console.error("Can't access AMINER_EPIDEMIC_API.", error);
//                 reject(error);
//             });
//     });
// }

// // Retrieve middleware
// router.use('/epidemic', function (req, res, next) {
//     if (Date.now() - epidemicData.updateTime >= apis.AMINER_EPIDEMIC_API_UPDATE_INTERVAL) {
//         // periodically update epidemic data from source
//         acquireEpidemicData().then(val => {
//             epidemicData = val;
//             res.attached = epidemicData.data;
//             next();
//             fs.writeFile(cacheFilePath, JSON.stringify(epidemicData), err => { // async
//                 if (err) console.error("Can't write back to cache file path.", err);
//                 else debug("Epidemic data updated.");
//             });
//         }).catch(err => {
//             // fail to update
//             debug("Warning: fail to update from epidemic data source.");
//             res.attached = epidemicData.data; // use cached data
//             next();
//         })
//     } else {
//         // use cached data
//         res.attached = epidemicData.data;
//         next();
//     }
// });

/**
 * @api {get} /retrieve/epidemic  Get epidemic data api
 * @apiName GetEpidemicData
 * @apiGroup Retrieve
 * @apiPermission everyone
 *
 * @apiDescription Retrieve epidemic data in a specific superior place(world/country/province)
 * !! this apis is in progress
 *
 * @apiParam (Query Param) {string}  superiorPlace  superior place name
 * @apiParam (Query Param) {string}  dataKind       epidemic data kind
 *
 * @apiSuccess {Object}  . epidemic data in different inferior places and time stamps
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost:3000/retrieve/epidemic?superiorPlace=四川省&dataKind=confirmedCount"
 *
 * @apiExample Response (example):
 * {
 *   "superiorPlace": "四川省",
 *   "superiorLevel": "province",
 *   "dataKind": "confirmedCount",
 *   "inferiorPlaces": [
 *   	{
 *   		"place": "成都",
 *   		"values": [1, 2, 10, 100, 120],
 *   		"times": [1100, 1101, 1102, 1103]
 *   	},
 *   	{
 *   		"place": "乐山",
 *   		"values": [3, 5, 10, 100, 120],
 *   		"times": [1100, 1101, 1102, 1105]
 *   	},
 *   	{
 *   		"place": "眉山",
 *   		"values": [3, 5, 10, 100, 120],
 *   		"times": [1100, 1101, 1102, 1105]
 *   	}
 *   ]
 * }
 */
router.get('/epidemic', function (req, res, next) {
    let superiorPlace = req.query.superiorPlace;
    let dataKind = req.query.dataKind;
    if (superiorPlace === undefined || dataKind === undefined) {
        next(createError(400));
        return;
    }
    // todo unimplemented!
    if (superiorPlace === "四川省" && dataKind === "confirmedCount") {
        res.status(200).send(demoData);
    } else {
        res.status(404).end();
    }
}, function (err, req, res, next) {
    res.locals.message = `Wrong use of api.   Usage: ${req.path}?superiorPlace={...}&dataKind={...}`;
    res.status(err.status).render('error', {error: err});
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
