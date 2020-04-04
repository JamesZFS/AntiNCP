const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('../routes');
const usersRouter = require('../routes/users');
const db = require('../database');

const index = express();

// view engine setup
index.set('views', path.join(__dirname, 'views'));
index.set('view engine', 'pug');

index.use(logger('dev'));
index.use(express.json());
index.use(express.urlencoded({extended: false}));
index.use(cookieParser());
index.use(clientMonitor); // monitor client's behavior
index.use('/', express.static(path.resolve(__dirname, '../frontend/dist'))); // host frontend as static pages
index.use('/doc', express.static(path.join(__dirname, 'doc'))); 		   // show api document
index.use('/public', express.static(path.join(__dirname, 'public')));

index.use('/api', indexRouter);
index.use('/users', usersRouter);

// catch 404 and forward to error handler
index.use(function (req, res, next) {
    next(createError(404));
});

// error handler
index.use(function (err, req, res, next) {
    // render the error page
    res.status(err.status || 404);
    res.render('error', {message: err.message, status: err.status});
});

function clientMonitor (req, res, next) {
    db.updateClientInfo(db.escape(req.ip)); // not waiting for db
    next();
}

module.exports = index;
