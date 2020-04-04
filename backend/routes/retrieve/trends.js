'use strict';
const dateFormat = require('dateformat');
const createError = require('http-errors');
const router = require('express').Router();
const debug = require('debug')('backend:retrieve:trends');
const db = require('../../database');

Date.prototype.addDay = function (days = 1) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

/**
 * @api {get} /api/retrieve/trends/timeline/:dateMin/:dateMax/  Get trends timeline api
 * @apiName GetTrendsTimeline
 * @apiVersion 0.1.0
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
        "name": "coronaviru",
        "value": 25065.69000000006
    },
    {
        "name": "new",
        "value": 6859.9599999999955
    },
    {
        "name": "us",
        "value": 6742.839999999995
    }
 ]
 * @apiSampleRequest /api/retrieve/trends/timeline/:dateMin/:dateMax/
 */
router.get('/timeline/:dateMin/:dateMax', async function (req, res) {
    let dateMin = new Date(req.params.dateMin), dateMax = new Date(req.params.dateMax);
    let limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 1000);
    if (isNaN(dateMin.valueOf()) || isNaN(dateMax.valueOf())) {
        res.status(400).render('error', {message: 'date invalid!', status: 400});
        return;
    }
    if (dateMin > dateMax) {
        res.status(400).render('error', {message: 'dateMin should be no greater than dateMax!', status: 400});
        return;
    }
    debug(`dateMin: ${dateMin}, dateMax: ${dateMax}`);
    dateMin = db.escape(dateFormat(dateMin, 'yyyy-mm-dd'));
    dateMax = db.escape(dateFormat(dateMax.addDay(), 'yyyy-mm-dd'));
    try {
        let result = await db.selectInTable('Trends', ['word AS name', 'SUM(value) AS value'],
            `date BETWEEN ${dateMin} AND ${dateMax}`, false,
            `GROUP BY word ORDER BY value DESC LIMIT ${limit}`);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).end();
        throw err;
    }
});

module.exports = router;
