'use strict';
const router = require('express').Router();
const debug = require('debug')('backend:retrieve:articles');
const dateFormat = require('dateformat');
const db = require('../../database');

Date.prototype.addSec = function (secs = 1) {
    let date = new Date(this.valueOf());
    date.setSeconds(date.getSeconds() + secs);
    return date;
};


/**
 * @api {get} /api/retrieve/articles  Get articles via ids
 * @apiName GetArticles
 * @apiVersion 0.1.0
 * @apiGroup Articles
 * @apiPermission everyone
 *
 * @apiParam (Query) {int|string}   ids      article ids, can be a number or several numbers **joined by `,`**
 *   Notice: id is always s.t. id >= 1 (ids should be no more than 100 for a single query!)
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost/api/retrieve/articles?ids=2,3,5,5,6,7"
 *
 * @apiExample Response (example):
 {
    "count": 5,
    "articles": [
        {
            "id": 2,
            "date": "2020-04-02T03:06:21.000Z",
            "title": "Coronavirus: Australian scientists begin tests of potential vaccines",
            "link": "https://www.bbc.co.uk/news/world-australia-52130402",
            "creator": "British Broadcasting Corporation",
            "content": "The Covid-19 vaccine candidates will be tested on ferrets over three months in Australia.",
            "sourceName": "British Broadcasting Corporation",
            "sourceShort": "BBC"
        },
        ...
    ]
 }
 * @apiSampleRequest /api/retrieve/articles
 */
router.get('/', async function (req, res) {
    let ids = req.query.ids;
    try {
        if (ids === undefined) throw new Error('Query `ids` missing!');
        ids = ids.split(',').map(x => {
            let y = parseInt(x);
            if (isNaN(y)) throw new Error('`ids` parsing failed!');
            return db.escape(y);
        });
        if (ids.length <= 0) throw new Error('Query `ids` missing!');
        if (ids.length > 100) throw new Error('Cannot query for more than 100 results once!');
    } catch (err) {
        res.status(400).render('error', {message: err.message, status: 400});
        return;
    }
    try {
        let result = await db.selectArticles('*', `id IN (${ids.join(',')})`);
        res.status(200).send({
            count: result.length,
            articles: result
        });
    } catch (err) {
        res.status(500).end();
        debug('Unconfirmed error:', err);
    }
});


/**
 * @api {get} /api/retrieve/articles/timeRange/:timeMin/:timeMax  Get articles within time range
 * @apiName GetArticlesWithinTime
 * @apiVersion 0.1.0
 * @apiGroup Articles
 * @apiPermission everyone
 *
 * @apiParam (Param) {string}   timeMin  query time string lower bound (as accurate as a second)
 * @apiParam (Param) {string}   timeMax  query time string upper bound (INCLUDED)
 * @apiParam (Query) {string}   order    'asc' or 'desc' - return the result in time ascending order or descending order.
 *  By default 'desc'
 * @apiParam (Query) {int}      limit     maximum number of results expected to return, default: 20, always s.t. 1 <= limit <= 100
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost/api/retrieve/articles/timeRange/2020-4-4,10:00:00/2020-4.4.11:00:00?order=desc&limit=100"
 *
 * @apiExample Response (example):
 {
    "count": 31,
    "articles": [
        {
            "id": 3179,
            "date": "2020-04-04T02:58:38.000Z",
            "title": "Kit Siang urges govt to follow South Koreaâs âaggressiveâ mass testing model",
            "link": "https://malaysia.news.yahoo.com/kit-siang-urges-govt-south-025838650.html",
            "creator": "Yahoo Singapore",
            "content": "KUALA LUMPUR, April 4 â Veteran politician Lim Kit Siang has identified three main prongs of how the government can possibly overcome the Covid-19 pandemic, one of them involving mass testing of...",
            "sourceName": "Yahoo Singapore",
            "sourceShort": "Yahoo Singapore"
        },
        ...
    ]
 }
 * @apiSampleRequest /api/retrieve/articles/timeRange/:timeMin/:timeMax
 */
router.get('/timeRange/:timeMin/:timeMax', async function (req, res) {
    let timeMin = new Date(req.params.timeMin), timeMax = new Date(req.params.timeMax);
    try {
        if (isNaN(timeMin.valueOf()) || isNaN(timeMax.valueOf())) throw new Error('`timeMin` or `timeMax` invalid!');
        if (timeMin > timeMax) throw new Error('`timeMin` should be no greater than `timeMax`!');
    } catch (err) {
        res.status(400).render('error', {message: err.message, status: 400});
        return;
    }
    let limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100); // 1 ~ 100
    let order = typeof req.query.order === 'string' && req.query.order.toLowerCase() === 'asc' ? 'ASC' : 'DESC'; // default: 'DESC'
    timeMin = db.escape(dateFormat(timeMin, 'yyyy-mm-dd HH:MM:ss'));
    timeMax = db.escape(dateFormat(timeMax.addSec(), 'yyyy-mm-dd HH:MM:ss'));
    // debug(timeMin, timeMax);
    try {
        let result = await db.selectArticles('*', `date BETWEEN ${timeMin} AND ${timeMax}`,
            false, `ORDER BY date ${order} LIMIT ${limit}`);
        res.status(200).send({
            count: result.length,
            articles: result
        })
    } catch (err) {
        res.status(500).end();
        debug('Unconfirmed error:', err);
    }
});

module.exports = router;
