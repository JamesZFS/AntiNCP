const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('../routes');
const usersRouter = require('../routes/users');
const db = require('../database');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(clientMonitor); // monitor client's behavior
app.use('/', express.static(path.resolve(__dirname, '../../frontend/dist'))); // host frontend as static pages
app.use('/doc', express.static(path.join(__dirname, '../doc'))); 		   // show api document
app.use('/public', express.static(path.join(__dirname, '../public')));

app.use('/api', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // render the error page
    res.status(err.status || 404);
    res.render('error', {message: err.message, status: err.status});
});

function clientMonitor (req, res, next) {
    db.updateClientInfo(db.escape(req.ip)); // not waiting for db
    next();
}

module.exports = app;
