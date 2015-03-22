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

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var ga = require('node-ga');
var jackrabbit = require('jackrabbit');
var logger = require('morgan');
var mongodb = require('express-mongo-db');
var path = require('path');
var underscore = require('underscore');
router = express.Router();

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
apiRoutes(router);

var apiSystemRoutes = require(path.join(__dirname, 'routes', 'system'));
apiSystemRoutes(router);

var apiRoutesLegacy = require(path.join(__dirname, 'routes', 'api-legacy'));
apiRoutesLegacy(router);

var txtwebRoutes = require(path.join(__dirname, 'routes', 'txtweb'));
txtwebRoutes(router);

var webRoutes = require(path.join(__dirname, 'routes', 'web'));
webRoutes(router);

var app = express();

var loggerLevel = process.env.LOGGER_LEVEL || 'dev';
app.use(logger(loggerLevel));

app.set('title', 'VITacademics');

// Static and Favicon
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Cookie Parser
var secret = process.env.SECRET_KEY || 'randomsecretstring';
app.use(cookieParser(secret, {signed: true}));

// MongoDB
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
                connectTimeoutMS: 10000
            },
            auto_reconnect: true,
            poolSize: 50
        }
    }
};
app.use(mongodb(require('mongodb'), mongodbOptions));

// RabbitMQ
var amqpUri = process.env.AMQP_URI || 'amqp://localhost';
var queue = jackrabbit(amqpUri);
queue.queues = {
    main: 'VITacademics',
    mobile: 'mobile'
};
queue.on('connected', function () {
    var forEachQueue = function (elt, i, arr) {
        queue.create(elt, {prefetch: 0}, function () {
        });
    };
    underscore.values(queue.queues).forEach(forEachQueue);
});
app.use(function (req, res, next) {
    req.queue = queue;
    next();
});

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// New Relic in Template
if (newrelic) {
    app.locals.newrelic = newrelic;
}

// Google Analytics
var googleAnalyticsToken = process.env.GOOGLE_ANALYTICS_TOKEN || 'UA-35429946-2';
app.use(ga(googleAnalyticsToken, {
    safe: true
}));

// Allow Cross-Origin Resource Eharing
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Routes
app.use('/', webRoutes);
app.use('/api/txtweb', txtwebRoutes);
app.use('/api/v2/system', apiSystemRoutes);
app.use('/api/v2/vellore', apiRoutes);
app.use('/api/v2/chennai', apiRoutes);
app.use('/api/vellore', apiRoutesLegacy);
app.use('/api/chennai', apiRoutesLegacy);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers
// Development error handler, will print stacktrace
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

// Production error handler, no stacktraces leaked to user
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
