// Data retrieving system
'use strict';
const createError = require('http-errors');
const router = require('express').Router();
const epidemicRouter = require('./epidemic');
const trendsRouter = require('./trends');

router.use('/epidemic', epidemicRouter);
router.use('/trends', trendsRouter);

module.exports = router;
