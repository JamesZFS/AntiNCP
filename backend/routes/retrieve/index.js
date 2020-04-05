// Data retrieving system
'use strict';
const router = require('express').Router();

router.use('/epidemic', require('./epidemic'));
router.use('/trends', require('./trends'));
router.use('/articles', require('./articles'));

module.exports = router;
