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
 * @api {get} /api/retrieve/epidemic/timeline/world  Get world epidemic data timeline api
 * @apiName GetEpidemicDataTimelineWorld
 * @apiVersion 0.2.1
 * @apiGroup Timeline
 * @apiPermission everyone
 *
 * @apiParam (Query Param) {string}  dataKind    epidemic data kind, in {'confirmedCount', 'suspectedCount', 'curedCount', 'deadCount'}, can be multiple
 * @apiParam (Query Param) {none} verbose       return {name:..., value:...} or just the value buffer.
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost:3000/api/retrieve/epidemic/timeline/world/?dataKind=confirmedCount,deadCount"
 *
 * @apiExample Response (example):
 {
    "country": ["中国", "美国", "英国"],
    "worldTimeline": [
        "confirmedCount": [
			["2020-01-01", 10],
			["2020-01-02", 20],
			["2020-01-03", 30],
		],
		"deadCount": [
			["2020-01-01", 10],
			["2020-01-02", 20],
			["2020-01-03", 30],
		]
    ],
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
 * @apiSampleRequest /api/retrieve/epidemic/timeline/world
 */
router.get('/epidemic/timeline/world', async function (req, res) {
    let dataKinds = req.query.dataKind;
    let verbose = req.query.verbose !== undefined;
    // type & usage check
    if (dataKinds === undefined || (dataKinds = dataKinds.split(',')).some(value => EPIDEMIC_DATA_KINDS.indexOf(value) < 0)) { // invalid dataKind
        // handle 400 error
        let err = createError(400);
        res.locals.message = "Wrong use of api.  Usage example: " +
            "/retrieve/epidemic/timeline/world/?dataKind=confirmedCount,deadCount";
        res.status(err.status).render('error', {error: err});
        return;
    }
    try {
        { // Get epidemic world data, todo need faster impl
            var worldTimeline = {};
            for (let dataKind of dataKinds) {
                worldTimeline[dataKind] = [];
            }
            let fields = [`DATE_FORMAT(date,'%Y-%m-%d') AS date`].concat(dataKinds.map(val => `SUM(${val}) AS ${val}`));
            let condition = `province=''`; // for where clause
            let result = await db.selectEpidemicData(fields, condition, false, 'GROUP BY date ORDER BY date ASC');
            for (let item of result) {
                for (let dataKind of dataKinds) {
                    worldTimeline[dataKind].push([item.date, item[dataKind]]);
                }
            }
        }
        { // Get epidemic country data
            var countries = await db.selectAvailableCountries();
            countries = countries.map(value => value.country);
            // columns to select:
            let fields = [`DATE_FORMAT(date,'%Y-%m-%d') AS date`, `country`].concat(dataKinds);
            let condition = `province=''`; // province == '' means country entry
            let result = await db.selectEpidemicData(fields, condition, false,
                'GROUP BY country, date ORDER BY date ASC, country ASC');
            var series = {};
            // init timeline object
            for (let dataKind of dataKinds) {
                series[dataKind] = {};
            }
            let expCountryIdx = countries.length; // expected index in the countries table
            let expDate = '';
            let prevDate = '';
            // scan db result, O(N)
            for (let item of result) {
                if (item.date !== expDate) { // new date row
                    // complete the previous date data array
                    for (let dataKind of dataKinds) {
                        let a = series[dataKind][expDate]; // cur row
                        let b = series[dataKind][prevDate]; // prev row
                        for (let i = expCountryIdx; i < countries.length; ++i)
                            a[i] = (b === undefined ? (verbose ? {name: countries[i], value: 0} : 0) : b[i]);
                        series[dataKind][item.date] = []; // new array
                    }
                    expCountryIdx = 0;
                    prevDate = expDate;
                    expDate = item.date;
                }
                if (item.country !== countries[expCountryIdx]) { // expected country data missing
                    let j = expCountryIdx + 1;
                    while (countries[j] !== item.country) ++j;
                    for (let dataKind of dataKinds) {
                        let a = series[dataKind][expDate]; // cur row
                        let b = series[dataKind][prevDate]; // prev row
                        for (let i = expCountryIdx; i < j; ++i)
                            a[i] = (b === undefined ? (verbose ? {name: countries[i], value: 0} : 0) : b[i]);
                    }
                    expCountryIdx = j;
                }
                // item is the expected country: fill in new date item
                for (let dataKind of dataKinds) {
                    series[dataKind][expDate].push(verbose ? {
                        name: item.country,
                        value: item[dataKind],
                    } : item[dataKind]);
                }
                ++expCountryIdx;
            }
        }
        res.status(200).send({
            worldTimeline: worldTimeline,
            country: countries,
            timeline: series
        });
    } catch (err) {
        debug('Unconfirmed error:', err);
        res.status(500).end();
    }
});

/**
 * @api {get} /api/retrieve/epidemic/timeline/country  Get country epidemic data timeline api
 * @apiName GetEpidemicDataTimelineCountry
 * @apiVersion 0.2.1
 * @apiGroup Timeline
 * @apiPermission everyone
 *
 * @apiParam (Query Param) {string}  country
 * @apiParam (Query Param) {string}  dataKind    epidemic data kind, in {'confirmedCount', 'suspectedCount', 'curedCount', 'deadCount'}, can be multiple
 * @apiParam (Query Param) {none} verbose       return {name:..., value:...} or just the value buffer
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost:3000/api/retrieve/epidemic/timeline/country/?country=中国&dataKind=confirmedCount,deadCount"
 *
 * @apiExample Response (example):
 {
    "country": "中国",
	"superTimeline": {
	    "confirmedCount": [
			["2020-01-01", 10],
			["2020-01-02", 20],
			["2020-01-03", 30],
		],
		"deadCount": [
			["2020-01-01", 10],
			["2020-01-02", 20],
			["2020-01-03", 30],
		]
	},
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
 * @apiSampleRequest /api/retrieve/epidemic/timeline/country
 */
router.get('/epidemic/timeline/country', async function (req, res) {
    let country = req.query.country;
    let dataKinds = req.query.dataKind;
    let verbose = req.query.verbose !== undefined;
    // type & usage check
    if (country === undefined || dataKinds === undefined ||
        (dataKinds = dataKinds.split(',')).some(value => EPIDEMIC_DATA_KINDS.indexOf(value) < 0)) { // invalid dataKind
        // handle 400 error
        let err = createError(400);
        res.locals.message = "Wrong use of api.  Usage example: " +
            "/retrieve/epidemic/timeline/country/?country=中国&dataKind=confirmedCount,deadCount";
        res.status(err.status).render('error', {error: err});
        return;
    }
    try {
        { // Get epidemic country data
            var countryTimeline = {};
            for (let dataKind of dataKinds) {
                countryTimeline[dataKind] = [];
            }
            let fields = [`DATE_FORMAT(date,'%Y-%m-%d') AS date`].concat(dataKinds);
            let condition = `country='${country}' AND province=''`; // for where clause
            let result = await db.selectEpidemicData(fields, condition, false, 'GROUP BY date ORDER BY date ASC');
            for (let item of result) {
                for (let dataKind of dataKinds) {
                    countryTimeline[dataKind].push([item.date, item[dataKind]]);
                }
            }
        }
        { // Get epidemic province data
            var provinces = await db.selectAvailableProvinces(country);
            provinces = provinces.map(value => value.province);
            // columns to select:
            let fields = [`DATE_FORMAT(date,'%Y-%m-%d') AS date`, `province`].concat(dataKinds);
            let condition = `country='${country}' AND province<>'' AND city=''`; // city == '' means province entry
            let result = await db.selectEpidemicData(fields, condition, false,
                'GROUP BY province, date ORDER BY date ASC, province ASC');
            var series = {};
            // init timeline object
            for (let dataKind of dataKinds) {
                series[dataKind] = {};
            }
            let expProvinceIdx = provinces.length; // expected index in the provinces table
            let expDate = '';
            let prevDate = '';
            // scan db result, O(N)
            for (let item of result) {
                if (item.date !== expDate) { // new date row
                    // complete the previous date data array
                    for (let dataKind of dataKinds) {
                        let a = series[dataKind][expDate]; // cur row
                        let b = series[dataKind][prevDate]; // prev row
                        for (let i = expProvinceIdx; i < provinces.length; ++i)
                            a[i] = (b === undefined ? (verbose ? {name: provinces[i], value: 0} : 0) : b[i]);
                        series[dataKind][item.date] = []; // new array
                    }
                    expProvinceIdx = 0;
                    prevDate = expDate;
                    expDate = item.date;
                }
                if (item.province !== provinces[expProvinceIdx]) { // expected province data missing
                    let j = expProvinceIdx + 1;
                    while (provinces[j] !== item.province) ++j;
                    for (let dataKind of dataKinds) {
                        let a = series[dataKind][expDate]; // cur row
                        let b = series[dataKind][prevDate]; // prev row
                        for (let i = expProvinceIdx; i < j; ++i)
                            a[i] = (b === undefined ? (verbose ? {name: provinces[i], value: 0} : 0) : b[i]);
                    }
                    expProvinceIdx = j;
                }
                // item is the expected province: fill in new date item
                for (let dataKind of dataKinds) {
                    series[dataKind][expDate].push(verbose ? {
                        name: item.province,
                        value: item[dataKind],
                    } : item[dataKind]);
                }
                ++expProvinceIdx;
            }
        }
        res.status(200).send({
            country: country,
            countryTimeline: countryTimeline,
            province: provinces,
            timeline: series
        });
    } catch (err) {
        debug('Unconfirmed error:', err);
        res.status(500).end();
    }
});

/**
 * @api {get} /api/retrieve/epidemic/timeline/province  Get province epidemic data timeline api
 * @apiName GetEpidemicDataTimelineProvince
 * @apiVersion 0.2.1
 * @apiGroup Timeline
 * @apiPermission everyone
 *
 * @apiParam (Query Param) {string}  country
 * @apiParam (Query Param) {string}  province
 * @apiParam (Query Param) {string}  dataKind       epidemic data kind, in {'confirmedCount', 'suspectedCount', 'curedCount', 'deadCount'}, can be multiple
 * @apiParam (Query Param) {none} verbose        return {name:..., value:...} or just the value buffer. see the example 2 for details
 *
 * @apiExample {curl} Example usage 1:
 *     curl "http://localhost:3000/api/retrieve/epidemic/timeline/province/?country=中国&province=四川省&dataKind=confirmedCount,deadCount"
 *
 * @apiExample Response (example 1):
 {
    "country": "中国",
	"province": "四川省",
	"provinceTimeline": {
	    "confirmedCount": [
			["2020-01-01", 10],
			["2020-01-02", 20],
			["2020-01-03", 30],
		],
		"deadCount": [
			["2020-01-01", 10],
			["2020-01-02", 20],
			["2020-01-03", 30],
		]
	},
	"city": ["成都市", "乐山市", "眉山市"],
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
 *     curl "http://localhost:3000/api/retrieve/epidemic/timeline/province/?country=中国&province=四川省&dataKind=confirmedCount,deadCount&verbose"
 *
 * @apiExample Response (example 2):
 {
    "country": "中国",
	"province": "四川省",
	"provinceTimeline": {
	    "confirmedCount": [
			["2020-01-01", 10],
			...
		],
		"deadCount": [
			["2020-01-01", 10],
			...
		]
	}
	"city": ["成都", "乐山", "眉山"],
	"timeline": {
		"confirmedCount": {
			"2020-01-01": [{"name":"成都市", "value":1}, {"name":"乐山市", "value":2}, {...}],
			"2020-01-02": [{...},{...},{...}],
		},
		"deadCount": {
			"2020-01-01": [...],
			"2020-01-02": [...],
		}
	}
 }
 * @apiSampleRequest /api/retrieve/epidemic/timeline/province
 */
router.get('/epidemic/timeline/province', async function (req, res) {
    let country = req.query.country;
    let province = req.query.province;
    let dataKinds = req.query.dataKind;
    let verbose = req.query.verbose !== undefined;
    // type & usage check
    if (country === undefined || province === undefined || dataKinds === undefined ||
        (dataKinds = dataKinds.split(',')).some(value => EPIDEMIC_DATA_KINDS.indexOf(value) < 0)) { // invalid dataKind
        // handle 400 error
        let err = createError(400);
        res.locals.message = "Wrong use of api.  Usage example: " +
            "/retrieve/epidemic/timeline/province/?country=中国&province=四川省&dataKind=confirmedCount,deadCount";
        res.status(err.status).render('error', {error: err});
        return;
    }
    try {
        { // Get epidemic provincial data
            var provinceTimeline = {};
            for (let dataKind of dataKinds) {
                provinceTimeline[dataKind] = [];
            }
            let fields = [`DATE_FORMAT(date,'%Y-%m-%d') AS date`].concat(dataKinds);
            let condition = `country='${country}' AND province='${province}' AND city=''`; // for where clause
            let result = await db.selectEpidemicData(fields, condition, false, 'GROUP BY date ORDER BY date ASC');
            for (let item of result) {
                for (let dataKind of dataKinds) {
                    provinceTimeline[dataKind].push([item.date, item[dataKind]]);
                }
            }
        }
        { // Get epidemic city data
            var cities = await db.selectAvailableCities(country, province);
            cities = cities.map(value => value.city);
            // columns to select:
            let fields = [`DATE_FORMAT(date,'%Y-%m-%d') AS date`, `city`].concat(dataKinds);
            let condition = `country='${country}' AND province='${province}' AND city<>''`; // for where clause
            let result = await db.selectEpidemicData(fields, condition, false,
                'GROUP BY city, date ORDER BY date ASC, city ASC');
            var series = {};
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
                        for (let i = expCityIdx; i < cities.length; ++i)
                            a[i] = (b === undefined ? (verbose ? {name: cities[i], value: 0} : 0) : b[i]);
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
                        for (let i = expCityIdx; i < j; ++i)
                            a[i] = (b === undefined ? (verbose ? {name: cities[i], value: 0} : 0) : b[i]);
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
        }
        res.status(200).send({
            country: country,
            province: province,
            provinceTimeline: provinceTimeline,
            city: cities,
            timeline: series
        });
    } catch (err) {
        debug('Unconfirmed error:', err);
        res.status(500).end();
    }
});


router.get('/test', function (req, res) {
    res.status(200)
        .send({
            result: "ok!"
        });
});

module.exports = router;
