var express = require('express');
var router = express.Router();
var retrieveRouter = require('./retireve');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

router.use('/retrieve', retrieveRouter);

module.exports = router;
