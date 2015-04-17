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

'use strict';

var async = require('async');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var ga = require('node-ga');
var jackrabbit = require('jackrabbit');
var logger = require('morgan');
var mongoClient = require('mongodb').MongoClient;
var path = require('path');
var underscore = require('underscore');

var newrelic;
if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE) {
  newrelic = require('newrelic');
}

var log;
if (process.env.LOGENTRIES_TOKEN) {
  let logentries = require('node-logentries');
  log = logentries.logger({
    token: process.env.LOGENTRIES_TOKEN
  });
}

var apiRoutes = require(path.join(__dirname, 'routes', 'api'));
var apiSystemRoutes = require(path.join(__dirname, 'routes', 'system'));
var apiRoutesLegacy = require(path.join(__dirname, 'routes', 'api-legacy'));
var txtwebRoutes = require(path.join(__dirname, 'routes', 'txtweb'));
var webRoutes = require(path.join(__dirname, 'routes', 'web'));

var app = express();

async.waterfall([
  function (callback) {
    let loggerLevel = process.env.LOGGER_LEVEL || 'dev';
    app.use(logger(loggerLevel));

    app.set('title', 'VITacademics');

    // Static and Favicon
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));

    // Body Parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    // Cookie Parser
    let secret = process.env.SECRET_KEY || 'randomsecretstring';
    app.use(cookieParser(secret, {signed: true}));

    // View Engine
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    // New Relic in Template
    if (newrelic) {
      app.locals.newrelic = newrelic;
    }

    // Google Analytics
    let googleAnalyticsToken = process.env.GOOGLE_ANALYTICS_TOKEN || 'UA-35429946-2';
    app.use(ga(googleAnalyticsToken, {
      safe: true
    }));

    // Allow Cross-Origin Resource Eharing
    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    callback(null);
  },
  function (callback) {
    // MongoDB
    let mongoList = [
      process.env.MONGODB_URI_0 || 'mongodb://localhost:27017/VITacademics',
      process.env.MONGODB_URI_1 || 'mongodb://localhost:27017/VITacademics',
      process.env.MONGODB_URI_2 || 'mongodb://localhost:27017/VITacademics',
      process.env.MONGODB_URI_3 || 'mongodb://localhost:27017/VITacademics',
      process.env.MONGODB_URI_4 || 'mongodb://localhost:27017/VITacademics',
      process.env.MONGODB_URI || 'mongodb://localhost:27017/VITacademics'
    ];

    var forEachMongoDB = function (mongoURI, asyncCallback) {
      let mongodbOptions = {
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
      };
      mongoClient.connect(mongoURI, mongodbOptions, asyncCallback)
    };

    var allMongoDB = function (err, results) {
      app.use(function (req, res, next) {
        req.dbs = results;
        next();
      });

      callback(err)
    };

    async.map(mongoList, forEachMongoDB, allMongoDB);
  },
  function (callback) {
    // RabbitMQ
    let amqpUri = process.env.AMQP_URI || 'amqp://localhost';

    var queue = jackrabbit(amqpUri);

    queue.queues = {
      main: 'Main',
      mobile: 'Mobile',
      share: 'Share'
    };

    app.use(function (req, res, next) {
      req.queue = queue;
      next();
    });

    queue.on('connected', function () {
      var forEachQueue = function (elt, asyncCallback) {
        queue.create(elt, {prefetch: 0}, asyncCallback);
      };
      var allQueues = function (err, results) {
        callback(err);
      };
      async.map(underscore.values(queue.queues), forEachQueue, allQueues);
    });


  },
  function (callback) {
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
      let err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // Error handlers
    // Development error handler, will print stacktrace
    let googleAnalyticsToken = process.env.GOOGLE_ANALYTICS_TOKEN || 'UA-35429946-2';
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

    callback(null);
  }
], function (err) {
  if (err) {
    throw err;
  }
  else {
    console.log('Express.js Configuration Successful');
  }
});

module.exports = app;
