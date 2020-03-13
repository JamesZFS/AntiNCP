const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const debug = require('debug')('backend:retrieve');
const db = require('../database/db-manager');
const EPIDEMIC_DATA_KINDS = require('../config/db-cfg').EPIDEMIC_DATA_KINDS;
const EPIDEMIC_USAGE = require('../config/consts').EPIDEMIC_USAGE;

const TO_INFERIOR = {
    'world': 'country',
    'country': 'province',
    'province': 'city'
};

/**
 * @api {get} /retrieve/epidemic  Get epidemic data api
 * @apiName GetEpidemicData
 * @apiVersion 0.1.1
 * @apiGroup Retrieve
 * @apiPermission everyone
 *
 * @apiDescription Retrieve epidemic data in a specific superior place(world/country/province)
 *
 * **this apis is in progress (world and China overall data is not available)**
 *
 * @apiParam (Query Param) {string}  dataKind       epidemic data kind, in {'confirmedCount', 'suspectedCount', 'curedCount', 'deadCount'}
 * @apiParam (Query Param) {string}  superiorPlace  superior place name
 * @apiParam (Query Param) {string}  superiorLevel  superior place level, in {'world', 'country', 'province'}
 *
 * @apiSuccess {Object}  . epidemic data in different inferior places and time stamps
 * @apiError 400   wrong usage or param invalid
 * @apiError 404   place not found
 *
 * @apiError 500   internal database error
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
 *   		"name": "成都",
 *   		"values": [1, 2, 10, 100, 120],
 *   		"times": [1100, 1101, 1102, 1103]
 *   	},
 *   	{
 *   		"name": "乐山",
 *   		"values": [3, 5, 10, 100, 120],
 *   		"times": [1100, 1101, 1102, 1105]
 *   	},
 *   	{
 *   		"name": "眉山",
 *   		"values": [3, 5, 10, 100, 120],
 *   		"times": [1100, 1101, 1102, 1105]
 *   	}
 *   ]
 * }
 */
router.get('/epidemic', async function (req, res) {
    let superiorLevel = req.query.superiorLevel;
    let superiorPlace = req.query.superiorPlace;
    let dataKind = req.query.dataKind;
    // type & usage check
    if (typeof superiorLevel !== 'string' || typeof superiorPlace !== 'string' || typeof dataKind !== 'string' ||
        TO_INFERIOR[superiorLevel] === undefined || EPIDEMIC_DATA_KINDS.indexOf(dataKind) < 0) {
        // handle 400 error
        let err = createError(400);
        res.locals.message = EPIDEMIC_USAGE;
        res.status(err.status).render('error', {error: err});
        return;
    }
    let conditions = []; // for where clause
    let fields = ['time', dataKind]; // columns to select
    switch (superiorLevel) {
        case 'world':
            fields.push('country');
            conditions.push(`province = '-'`); // means country data
            res.status(404).send('Unimplemented!');
            return;
        case 'country':
            fields.push('province');
            conditions.push(`country = '${superiorPlace}'`, `city = '-'`); // means province data
            res.status(404).send('Unimplemented!');
            return;
        case 'province':
            fields.push('city');
            conditions.push(`province = '${superiorPlace}'`);
            break;
    }
    let inferiorLevel = TO_INFERIOR[superiorLevel];
    let inferiorPlaces;
    let result;
    // search for satisfying results in db
    try {
        // scan inferior place list
        inferiorPlaces = await db.selectEpidemicData(inferiorLevel, conditions, true);
        if (!inferiorPlaces) {
            res.status(404).send(`Superior place '${superiorPlace}' not found`);
            return;
        }
        // get epidemic data array
        result = await db.selectEpidemicData(fields, conditions);
    } catch (err) {
        res.status(500).send("epidemic database error");
        debug('Cannot select epidemic data.');
        throw err;
    }
    // reconstruct response json, see demo-response.json for illustration
    let inferiorPlaceBuffer = [];
    for (let place of inferiorPlaces) {
        place = place[inferiorLevel];
        let item = {
            name: place,
            values: [],
            times: [],
        };
        for (let packet of result) {
            if (packet[inferiorLevel] === place) {
                item.values.push(packet[dataKind]);
                item.times.push(Date.parse(packet['time']) / 1000); // to unix time
            }
        }
        inferiorPlaceBuffer.push(item);
    }
    res.status(200).send({
        superiorPlace: superiorPlace,
        superiorLevel: superiorLevel,
        dataKind: dataKind,
        inferiorPlaces: inferiorPlaceBuffer,
    });
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
 * curl -i http://localhost:3000/retrieve/test
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
