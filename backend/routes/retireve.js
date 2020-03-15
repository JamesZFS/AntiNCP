const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const debug = require('debug')('backend:retrieve');
const db = require('../database/db-manager');
const EPIDEMIC_DATA_KINDS = require('../config/db-cfg').EPIDEMIC_DATA_KINDS;

const TO_INFERIOR = {
    'world': 'country',
    'country': 'province',
    'province': 'city'
};

/**
 * @api {get} /retrieve/epidemic  Get epidemic data api
 * @apiName GetEpidemicData
 * @apiVersion 0.1.0
 * @apiGroup Retrieve
 * @apiPermission everyone
 * @apiDeprecated
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
router.get('/epidemic', async function (req, res) {
    let superiorLevel = req.query.superiorLevel;
    let superiorPlace = req.query.superiorPlace;
    let dataKind = req.query.dataKind;
    // type & usage check
    if (superiorLevel === undefined || superiorPlace === undefined || dataKind === undefined ||
        TO_INFERIOR[superiorLevel] === undefined || EPIDEMIC_DATA_KINDS.indexOf(dataKind) < 0) {
        // handle 400 error
        let err = createError(400);
        res.locals.message = "Wrong use of api.   " +
            "Usage: /retrieve/epidemic?superiorPlace={...}" +
            "&superiorLevel={'world', 'country', 'province'}" +
            "&dataKind={'confirmedCount', 'suspectedCount', 'curedCount', 'deadCount'}";
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
            place: place,
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
 * @api {get} /retrieve/epidemic/timeline/world  Get world epidemic data timeline api
 * @apiName GetEpidemicDataTimelineWorld
 * @apiVersion 0.1.0
 * @apiGroup Retrieve
 * @apiPermission everyone
 * @apiIgnore Not finished Method
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost:3000/retrieve/epidemic/timeline/world/?dataKind=confirmedCount,deadCount"
 *
 * @apiExample Response (example):
 {
    "country": ["中国", "美国", "英国"]
	"timeline": {
		"confirmedCount": {
			"1-1": [1, 2, 10],
			"1-2": [2, 3, 11],
			"1-3": [2, 4, 10]
		},
		"deadCount": {
			"1-1": [1, 2, 10],
			"1-2": [1, 3, 11],
			"1-3": [1, 3, 12]
		}
	}
 }
 */
router.get('/epidemic/timeline/world', function (req, res) {
    res.status(403).send('unimplemented!');
});

/**
 * @api {get} /retrieve/epidemic/timeline/country  Get country epidemic data timeline api
 * @apiName GetEpidemicDataTimelineCountry
 * @apiVersion 0.1.0
 * @apiGroup Retrieve
 * @apiPermission everyone
 * @apiIgnore Not finished Method
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost:3000/retrieve/epidemic/timeline/country/?country=中国&dataKind=confirmedCount,deadCount"
 *
 * @apiExample Response (example):
 {
    "country": "中国",
	"province": ["四川省", "湖北省", "陕西省"],
	"timeline": {
		"confirmedCount": {
			"1-1": [1, 2, 10],
			"1-2": [2, 3, 11],
			"1-3": [2, 4, 10]
		},
		"deadCount": {
			"1-1": [1, 2, 10],
			"1-2": [1, 3, 11],
			"1-3": [1, 3, 12]
		}
	}
 }
 */
router.get('/epidemic/timeline/country', function (req, res) {
    res.status(403).send('unimplemented!');
});

/**
 * @api {get} /retrieve/epidemic/timeline/province  Get province epidemic data timeline api
 * @apiName GetEpidemicDataTimelineProvince
 * @apiVersion 0.1.1
 * @apiGroup Retrieve
 * @apiPermission everyone
 *
 * @apiParam (Query Param) {string}  country
 * @apiParam (Query Param) {string}  province
 * @apiParam (Query Param) {string}  dataKind       epidemic data kind, in {'confirmedCount', 'suspectedCount', 'curedCount', 'deadCount'}, can be multiple
 * @apiParam (Query Param) {none} verbose        return {name:..., value:...} or just the value buffer. see the example 2 for details
 *
 * @apiExample {curl} Example usage 1:
 *     curl "http://localhost:3000/retrieve/epidemic/timeline/province/?country=中国&province=四川省&dataKind=confirmedCount,deadCount"
 *
 * @apiExample Response (example 1):
 {
    "country": "中国",
	"province": "四川省",
	"city": ["成都", "乐山", "眉山"],
	"timeline": {
		"confirmedCount": {
			"2020-01-01": [1, 2, 10],
			"2020-01-02": [2, 3, 11],
			"2020-01-03": [2, 4, 10]
		},
		"deadCount": {
			"2020-01-01": [1, 2, 10],
			"2020-01-02": [1, 3, 11],
			"2020-01-03": [1, 3, 12]
		}
	}
 }
 *
 * @apiExample {curl} Example usage 2:
 *     curl "http://localhost:3000/retrieve/epidemic/timeline/province/?country=中国&province=四川省&dataKind=confirmedCount,deadCount&verbose"
 *
 * @apiExample Response (example 2):
 {
    "country": "中国",
	"province": "四川省",
	"city": ["成都", "乐山", "眉山"],
	"timeline": {
		"confirmedCount": {
			"2020-01-01": [{"name":"成都", "value":1}, {"name":"乐山", "value":2}, {...}],
			"2020-01-02": [{...},{...},{...}],
		},
		"deadCount": {
			"2020-01-01": [...],
			"2020-01-02": [...],
		}
	}
 }
 */
router.get('/epidemic/timeline/province', async function (req, res) {
    let country = req.query.country;
    let province = req.query.province;
    let dataKind = req.query.dataKind;
    let verbose = req.query.verbose !== undefined;
    // type & usage check
    if (country === undefined || province === undefined || dataKind === undefined ||
        dataKind.split(',').some(value => EPIDEMIC_DATA_KINDS.indexOf(value) < 0)) { // invalid dataKind
        // handle 400 error
        let err = createError(400);
        res.locals.message = "Wrong use of api.  Usage example: " +
            "/retrieve/epidemic/timeline/province/?country=中国&province=四川省&dataKind=confirmedCount,deadCount";
        res.status(err.status).render('error', {error: err});
        return;
    }
    try {
        let cities = await db.selectAvailableCities(country, province);
        if (cities.length === 0) {
            res.status(404).send("country or province not found.");
            return;
        }
        cities = cities.map(value => value.city);
        // debug('cities:', cities);
        let fields = `DATE_FORMAT(date,'%Y-%m-%d') AS date, city, ${dataKind}`; // columns to select
        let condition = `country='${country}' and province='${province}'`; // for where clause
        let result = await db.selectEpidemicData(fields, condition, false,
            'GROUP BY city, date ORDER BY date ASC, city ASC');
        let dataKinds = dataKind.split(',');
        let series = {};
        // init timeline object
        for (let dataKind of dataKinds) {
            series[dataKind] = {};
        }
        let expCityIdx = cities.length; // expected index in the cities table
        let expDate = '';
        let prevDate = '';
        // scan db result, O(N)
        for (let item of result) {
            if (item.date !== expDate) { // new date row
                // complete the previous date data array
                for (let dataKind of dataKinds) {
                    let a = series[dataKind][expDate]; // cur row
                    let b = series[dataKind][prevDate]; // prev row
                    for (let i = expCityIdx; i < cities.length; ++i) a[i] = (b === undefined ? NaN : b[i]);
                    series[dataKind][item.date] = []; // new array
                }
                expCityIdx = 0;
                prevDate = expDate;
                expDate = item.date;
            }
            if (item.city !== cities[expCityIdx]) { // expected city data missing
                let j = expCityIdx + 1;
                while (cities[j] !== item.city) ++j;
                for (let dataKind of dataKinds) {
                    let a = series[dataKind][expDate]; // cur row
                    let b = series[dataKind][prevDate]; // prev row
                    for (let i = expCityIdx; i < j; ++i) a[i] = (b === undefined ? NaN : b[i]);
                }
                expCityIdx = j;
            }
            // item is the expected city: fill in new date item
            for (let dataKind of dataKinds) {
                series[dataKind][expDate].push(verbose ? {
                    name: item.city,
                    value: item[dataKind],
                } : item[dataKind]);
            }
            ++expCityIdx;
        }
        res.status(200).send({
            country: country,
            province: province,
            city: cities,
            timeline: series
        });
    } catch (err) {
        debug('Unconfirmed error:', err);
        res.status(500).end();
    }
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
