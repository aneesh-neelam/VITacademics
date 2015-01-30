/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2015  Karthik Balakrishnan <karthikb351@gmail.com>
 *  Copyright (C) 2015  Sreeram Boyapati <sreeram.boyapati2011@gmail.com>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var favicon = require('serve-favicon');
var csrf = require('csurf');
var session = require('express-session');
var ga = require('node-ga');
var logger = require('morgan');
var mongodb = require('express-mongo-db');
var jackrabbit = require('jackrabbit');
var path = require('path');

var newrelic;
if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE) {
    newrelic = require('newrelic');
}

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

var apiRoutes = require(path.join(__dirname, 'routes', 'api'));
var testRoutes = require(path.join(__dirname, 'routes', 'test'));
var txtwebRoutes = require(path.join(__dirname, 'routes', 'txtweb'));
var webRoutes = require(path.join(__dirname, 'routes', 'web'));

var app = express();

if (newrelic) {
    app.locals.newrelic = newrelic;
}

var loggerLevel = process.env.LOGGER_LEVEL || 'dev';
app.use(logger(loggerLevel));

app.set('title', 'VITacademics');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var secret = process.env.SECRET_KEY || 'randomsecretstring';
app.use(cookieParser(secret, {signed: true}));

var mongodbOptions = {
    hosts: [{
        host: process.env.MONGODB_HOST || '127.0.0.1',
        port: process.env.MONGODB_PORT || '27017'
    }],
    database: process.env.MONGODB_DATABASE || 'VITacademics',
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    options: {
        db: {
            native_parser: true,
            recordQueryStats: true,
            retryMiliSeconds: 500,
            numberOfRetries: 10
        },
        server: {
            socketOptions: {
                keepAlive: 1,
                connectTimeoutMS: 30000
            },
            auto_reconnect: true,
            poolSize: 100
        }
    }
};
app.use(mongodb(require('mongodb'), mongodbOptions));

var amqpUri = process.env.AMQP_URI || 'amqp://localhost';
var queue = jackrabbit(amqpUri);
queue.on('connected', function () {
    var onReady = function () {
    };
    queue.create('VITacademics', {prefetch: 0}, onReady);
});
app.use(function (req, res, next) {
    queue.name = 'VITacademics';
    req.queue = queue;
    next();
});

/*
// ***CSRF Protection***
// Initializing sessions (backend storage)
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true
}));
app.use(csrf());
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var googleAnalyticsToken = process.env.GOOGLE_ANALYTICS_TOKEN || 'UA-35429946-2';
app.use(ga(googleAnalyticsToken, {
    safe: true
}));

// Allow cross-origin resource sharing
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', webRoutes);
app.use('/tests', testRoutes);
app.use('/api/txtweb', txtwebRoutes);
app.use('/api/vellore', apiRoutes);
app.use('/api/chennai', apiRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler, will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        if (log) {
            log.log('debug', {Error: err, Message: err.message});
        }
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            status: err.status,
            stack: err.stack,
            googleAnalyticsToken: googleAnalyticsToken
        });
    });
}

// production error handler, no stacktraces leaked to user
app.use(function (err, req, res, next) {
    if (log) {
        log.log('debug', {Error: err, Message: err.message});
    }
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status: err.status,
        stack: '',
        googleAnalyticsToken: googleAnalyticsToken
    });
});

module.exports = app;
