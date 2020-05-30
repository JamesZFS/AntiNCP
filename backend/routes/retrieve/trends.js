'use strict';
const dateFormat = require('dateformat');
const router = require('express').Router();
const debug = require('debug')('backend:retrieve:trends');
const db = require('../../database');
require('../../analyze/preprocess');
require('../../utils/date');

/**
 * @api {get} /api/retrieve/trends/timeline/:dateMin/:dateMax  Get trends timeline api
 * @apiName GetTrendsTimeline
 * @apiVersion 1.1.0
 * @apiGroup Trends
 * @apiPermission everyone
 *
 * @apiParam (Param) {string}  dateMin    date string in host's timezone, lower query bound(included)
 * @apiParam (Param) {string}  dateMax    date string in host's timezone, upper query bound(included), should be no lesser than `dateMin`
 * @apiParam (Query) {int}     limit      maximum number of results expected to return, default: 20, always s.t. 1 <= limit <= 1000
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost/api/retrieve/trends/timeline/2020-1-1/2020-4-4/?limit=3"
 *
 * @apiExample Response (example):
 [
 {
        "name": "Coronavirus",
        "value": 0.1,
        "incr": 0.2,
    },
 {
        "name": "new",
        "value": 0.01,
        "incr": 0.3,
    },
 {
        "name": "us",
        "value": 0.001
        "incr": 0.5,
    }
 ]
 * @apiSampleRequest /api/retrieve/trends/timeline/:dateMin/:dateMax
 */
router.get('/timeline/:dateMin/:dateMax', async function (req, res) {
    let dateMin = new Date(req.params.dateMin), dateMax = new Date(req.params.dateMax);
    // Validate date:
    if (isNaN(dateMin.valueOf()) || isNaN(dateMax.valueOf())) {
        res.status(400).render('error', {message: 'date invalid!', status: 400});
        return;
    }
    if (dateMin > dateMax) {
        res.status(400).render('error', {message: 'dateMin should be no greater than dateMax!', status: 400});
        return;
    }
    let limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 1000); // 1 ~ 1000
    try {
        let result = await searchTrendsByDate(dateMin, dateMax, limit);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).end();
        debug('Unconfirmed error:', err);
    }
});


/**
 * @api {get} /api/retrieve/trends/curve/:dateMin/:dateMax  Get trends curve
 * @apiName GetTrendsCurve
 * @apiVersion 1.0.0
 * @apiGroup Trends
 * @apiPermission everyone
 *
 * @apiParam (Param) {string}  dateMin    date string in host's timezone, lower query bound(included)
 * @apiParam (Param) {string}  dateMax    date string in host's timezone, upper query bound(included), should be no lesser than `dateMin`
 * @apiParam (Query) {string}  words      words to query for article ids,
 *  better not be stop words, no more than 20 words each query, or **a 400 response** will be returned
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost/api/retrieve/trends/curve/2020-4-1/2020-4-4?words=China,quarantine"
 *
 * @apiExample Response (example):
 {
    "labels": ["2020-1-1", "2020-1-2", "2020-1-3"],
    "stems": ["China", "quarantine"],
    "series": [
        [0.1, 0, 0.2],
        [0.2, 0.1, 0.9]
    ]
 }
 * @apiSampleRequest /api/retrieve/trends/curve/:dateMin/:dateMax
 */
router.get('/curve/:dateMin/:dateMax', async function (req, res) {
    // Validate date & words:
    let params = parseStemsAndDates(req, res);
    if (!params) return;
    let {dateMin, dateMax, words} = params; // words are stemmed
    const dateMinStr = db.escape(dateFormat(dateMin, 'yyyy-mm-dd'));
    const dateMaxStr = db.escape(dateFormat(dateMax, 'yyyy-mm-dd'));
    let labels = [], series = [];
    for (let day = dateMin; day <= dateMax; day = day.addDay()) labels.push(dateFormat(day, 'mm-dd'));
    try {
        for (let word of words) {
            let result = await db.doSql(`SELECT date, ROUND(freq, 6) as freq FROM Trends WHERE stem=${db.escape(word)} AND date BETWEEN ${dateMinStr} AND ${dateMaxStr} ORDER BY date`);
            // normalize result:
            let curSeries = [];
            let expDate = dateMin;
            for (let {date, freq} of result) {
                while (expDate < date) { // some dates missing
                    curSeries.push(0);
                    expDate = expDate.addDay();
                }
                curSeries.push(freq);
                expDate = expDate.addDay();
            }
            while (expDate <= dateMax) { // rear missing
                curSeries.push(0);
                expDate = expDate.addDay();
            }
            series.push(curSeries);
        }
    } catch (e) {
        res.status(500).end();
        debug('Unconfirmed error:', e);
        return;
    }
    res.status(200).json({
        labels,
        stems: words,
        series
    })
});


/**
 * @api {get} /api/retrieve/trends/articleId/:dateMin/:dateMax  Get article id via words api
 * @apiName GetTrendsArticleIds
 * @apiVersion 1.0.0
 * @apiGroup Trends
 * @apiPermission everyone
 *
 * @apiParam (Param) {string}  dateMin    date string in host's timezone, lower query bound(included)
 * @apiParam (Param) {string}  dateMax    date string in host's timezone, upper query bound(included), should be no lesser than `dateMin`
 * @apiParam (Query) {string}  words      words to query for article ids,
 *  better not be stop words, no more than 20 words each query, or **a 400 response** will be returned
 * @apiParam (Query) {string}   mode      'or' | 'and', default 'and', to specify how the corresponding ids should be merged
 *  (and - intersect, or - union)
 * @apiParam (Query) {string}   topics   topics(as id) to query for article ids
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost/api/retrieve/trends/articleId/2020-4-1/2020-4-4?words=China,quarantine&mode=and"
 *
 * @apiExample Response (example):
 {
    "count": 10,
    "articleIds": [
        2395,
        2398,
        1959,
        2519,
        2634,
        3165,
        1652,
        1554,
        1956,
        2472
    ]
 }
 * @apiSampleRequest /api/retrieve/trends/articleId/:dateMin/:dateMax
 */
router.get('/articleId/:dateMin/:dateMax', async function (req, res) {
    // Validate date & words:
    let params = parseStemsAndDates(req, res);
    if (!params) return;
    let {dateMin, dateMax, words} = params;
    let modeOr = typeof req.query.mode === 'string' && req.query.mode.toLowerCase() === 'or'; // default: 'and'
    let topics = [];
    { // check topics
        if (req.query.topics) for (let id of req.query.topics.split(',')) {
            let i = parseInt(id);
            if (isNaN(i)) {
                res.status(400).render('error', {message: 'Topic id parsing failed!', status: 400});
                return;
            }
            topics.push(i)
        }
    }
    try {
        let idsByStems = await searchIdsByStems(words, modeOr);
        if (idsByStems.size === 0) { // not found
            res.status(200).json({
                count: 0,
                articleIds: []
            });
            return;
        }
        // todo: possibly cache the map
        let idsByDate;
        let sortedIds = []; // sort by tfidf desc
        await Promise.all([ // Run in parallel
            new Promise(resolve => {
                sortedIds = [...idsByStems.entries()].sort((a, b) => b[1] - a[1]).map(x => x[0]);
                resolve();
            }),
            searchIdsByDate(dateMin, dateMax, topics).then(res => idsByDate = res),
        ]);
        let filteredIds = sortedIds.filter(id => idsByDate.has(id));
        // debug(sortedIds.length - filteredIds.length);
        res.status(200).json({
            count: filteredIds.length,
            articleIds: filteredIds,
        });
    } catch (err) {
        res.status(500).end();
        debug('Unconfirmed error:', err);
    }
});

/**
 * @param stems{string[]}
 * @param orMode{boolean}
 * @return {Promise<Map<int, float>>}
 */
async function searchIdsByStems(stems, orMode = false) {
    let acc = null; // Map: articleId => tfidf
    for (let stem of stems) {
        stem = db.escape(stem);
        let articleCount = await db.countTableRows('Articles');
        let res = await db.doSql(`
SELECT a.articleId AS id, a.freq /* tf */ * LOG(${articleCount} / b.count) /* idf */ AS tfidf 
FROM WordIndex a, WordIndexSumUp b WHERE a.stem = ${stem} AND b.stem = ${stem} ORDER BY tfidf DESC`);
        let cur = new Map(res.map(({id, tfidf}) => [id, tfidf])); // construct map
        if (!acc) // first stem
            acc = cur;
        else { // union or intersect keys based on `mode`
            if (orMode) {
                for (let [key, curVal] of cur) {
                    let oldVal = acc.get(key) || 0;
                    acc.set(key, oldVal + curVal);
                }
            } else { // and
                let newMap = new Map();
                for (let [key, curVal] of cur) {
                    let oldVal = acc.get(key);
                    if (oldVal) newMap.set(key, oldVal + curVal);
                }
                acc = newMap;
                if (acc.size === 0) { // early stop
                    break;
                }
            }
        }
    }
    return acc || new Map();
}

/**
 * @param dateMin{Date}
 * @param dateMax{Date}
 * @param topics{int[]}
 * @return {Promise<Set<int>>}
 */
async function searchIdsByDate(dateMin, dateMax, topics) {
    dateMin = db.escape(dateFormat(dateMin, 'yyyy-mm-dd'));
    dateMax = db.escape(dateFormat(dateMax.addDay(), 'yyyy-mm-dd'));
    let sql = `SELECT id FROM Articles WHERE date BETWEEN ${dateMin} AND ${dateMax}`;
    if (topics.length > 0) sql += ` AND topic in (${topics.slice(0, 10).join(',')})`;
    let res = await db.doSql(sql);
    return new Set(res.map(x => x.id));
}

/**
 * Query tf (within date params) and idf (from overall stat) -> tfidf -> sort -> limit -> lookup original word.
 * This is 100% MySQL operation, super fast.
 * @param dateMin{Date}
 * @param dateMax{Date}
 * @param limit{int}
 * @return {Promise<{string, float}[]>}
 */
async function searchTrendsByDate(dateMin, dateMax, limit) {
    const prevDay = db.escape(dateFormat(dateMin.addDay(-1), 'yyyy-mm-dd'));
    dateMin = db.escape(dateFormat(dateMin, 'yyyy-mm-dd'));
    dateMax = db.escape(dateFormat(dateMax, 'yyyy-mm-dd'));
    // const {globalDateMin, globalDateMax} = (await db.doSql('SELECT MIN(date) AS globalDateMin, MAX(date) AS globalDateMax FROM Articles'))[0];
    // const dayCount = Math.ceil(new Date(globalDateMax).dayDiff(new Date(globalDateMin)) + 1);
    const N = 60; // todo adjustable param
    return db.doSql(`
SELECT c.word AS name, ROUND(tmp.tfidf, 6) AS value, tmp.date AS date, tmp.tf - IFNULL(prev.freq, 0) AS incr
FROM (SELECT a.stem                                               AS stem,
             SUM(a.freq)                                          AS tf,
             SUM(a.freq) /* tf */ * LOG(${N} / b.count) /* idf */ AS tfidf,
             a.date                                               AS date
      FROM Trends a,
           TrendsSumUp b
      WHERE a.stem = b.stem
        AND a.date BETWEEN ${dateMin} AND ${dateMax}
      GROUP BY stem
      ORDER BY tfidf DESC
      LIMIT ${limit}) tmp
         LEFT JOIN Trends prev ON tmp.stem = prev.stem AND prev.date = ${prevDay}
         INNER JOIN Stem2Word c on c.stem = tmp.stem`);
}

function parseStemsAndDates(req, res) {
    let dateMin = new Date(req.params.dateMin), dateMax = new Date(req.params.dateMax), words = req.query.words;
    try {
        if (isNaN(dateMin.valueOf()) || isNaN(dateMax.valueOf())) throw new Error('`dateMin` or `dateMax` invalid!');
        if (dateMin > dateMax) throw new Error('`dateMin` should be no greater than `dateMax`!');
        if (words === undefined) throw new Error('Query `words` missing!');
        words = words.tokenizeAndStem();
        if (words.length === 0) throw new Error('Bad `words` param! (You may be missing the param or using stop words)');
        if (words.length > 20) throw new Error('Don\'t query for more than 20 words each time!');
    } catch (err) {
        res.status(400).render('error', {message: err.message, status: 400});
        return;
    }
    return {dateMin, dateMax, words};
}

module.exports = router;
