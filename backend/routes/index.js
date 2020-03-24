var express = require('express');
var router = express.Router();
var retrieveRouter = require('./retrieve');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.use('/retrieve', retrieveRouter);

/**
 * @api {get} /test Test api
 * @apiVersion 0.1.1
 * @apiName GetTest
 * @apiGroup Test
 * @apiPermission everyone
 *
 * @apiDescription A test api
 *
 * @apiExample Example usage:
 * curl http://localhost:3000/api/test
 *
 * @apiSuccess {String}   result    "ok!"
 *
 * @apiExample Response (example):
 *     "OK!"
 */
router.get('/test', function (req, res) {
    res.status(200).send("OK!");
});

module.exports = router;
