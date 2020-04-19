'use strict';
const router = require('express').Router();
const debug = require('debug')('backend:retrieve:articles');
const dateFormat = require('dateformat');
const db = require('../../database');
require('../../utils/date');

/**
 * @api {post} /api/retrieve/articles  Get articles via ids
 * @apiName GetArticles
 * @apiVersion 0.2.0
 * @apiGroup Articles
 * @apiPermission everyone
 *
 * @apiParam (Body) {int[]}   ids      article ids, should be int array
 *   Notice: id is always s.t. id >= 1 (ids should be **no more than 100** for a single query!)
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost/api/retrieve/articles" -X POST --data '{"ids": [3179, 3180, 3247, 3181, 3186]}'
 *
 * @apiExample Response (example):
 {
    "count": 5,
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
    ]
 }
 * @apiSampleRequest /api/retrieve/articles
 */
router.post('/', async function (req, res) {
    // console.log(req.body);
    let ids = req.body.ids;
    try {
        if (!(ids instanceof Array)) throw new Error('Body field `ids` missing!');
        ids = ids.map(x => {
            let i = parseInt(x);
            if (isNaN(i) || i < 0) throw new Error('`ids` parsing failed!');
            return i;
        });
        if (ids.length < 0) throw new Error('Query `ids` missing!');
        if (ids.length > 100) throw new Error('Cannot query for more than 100 results once!');
    } catch (err) {
        res.status(400).render('error', {message: err.message, status: 400});
        return;
    }
    if (ids.length === 0) {
        res.status(200).json({count: 0, articles: []});
        return;
    }
    try {
        ids = ids.join(',');
        let result = await db.selectArticles('*', `id IN (${ids})`, false, `ORDER BY FIELD(id,${ids})`);
        res.status(200).json({
            count: result.length,
            articles: result
        });
    } catch (err) {
        res.status(500).end();
        debug('Unconfirmed error:', err);
    }
});


/**
 * @api {get} /api/retrieve/articles/timeRange/:timeMin/:timeMax  Get article ids within time range
 * @apiName GetArticleIdsWithinTime
 * @apiVersion 0.2.0
 * @apiGroup Articles
 * @apiPermission everyone
 *
 * @apiParam (Param) {string}   timeMin  query time string lower bound (as accurate as a second)
 * @apiParam (Param) {string}   timeMax  query time string upper bound (INCLUDED)
 * @apiParam (Query) {string}   order    'asc' or 'desc' - return the result in time ascending order or descending order.
 *  By default 'desc'
 *
 * @apiExample {curl} Example usage:
 *     curl "http://localhost/api/retrieve/articles/timeRange/2020-4-4,10:00:00/2020-4.4.11:00:00?order=desc"
 *
 * @apiExample Response (example):
 {
    "count": 32,
    "articleIds":
    [
        3179, 3180, 3247, 3181, 3186, 3189, 3149, 4269, 3228, 3172, 3257, 3154, 3150, 3248, 3208, 3155, 4611, 3182, 3190,
        3170, 3151, 3280, 4185, 3156, 3157, 3152, 3232, 3158, 3159, 3191, 3160, 3133
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
    let order = typeof req.query.order === 'string' && req.query.order.toLowerCase() === 'asc' ? 'ASC' : 'DESC'; // default: 'DESC'
    timeMin = db.escape(dateFormat(timeMin, 'yyyy-mm-dd HH:MM:ss'));
    timeMax = db.escape(dateFormat(timeMax.addSec(), 'yyyy-mm-dd HH:MM:ss'));
    // debug(timeMin, timeMax);
    try {
        let result = await db.selectArticles('id', `date BETWEEN ${timeMin} AND ${timeMax}`,
            false, `ORDER BY date ${order}`);
        result = result.map(x => x.id);
        res.status(200).json({
            count: result.length,
            articleIds: result
        })
    } catch (err) {
        res.status(500).end();
        debug('Unconfirmed error:', err);
    }
});

module.exports = router;
