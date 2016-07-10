/*
 *  VITacademics
 *  Copyright (C) 2014-2016  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014-2016  Karthik Balakrishnan <karthikb351@gmail.com>
 *  Copyright (C) 2014-2016  Sreeram Boyapati <sreeram.boyapati2011@gmail.com>
 *
 *  This file is part of VITacademics.
 *
 *  VITacademics is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  VITacademics is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with VITacademics.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const async = require('async');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const ga = require('node-ga');
//const jackrabbit = require('jackrabbit');
const logger = require('morgan');
//const mongodb = require('express-mongo-db');
const mongoClient = require('mongodb');
const path = require('path');
const underscore = require('underscore');

const config = require(path.join(__dirname, 'config'));

let newrelic;
if (config.newRelicEnabled) {
  newrelic = require('newrelic');
}

let logentries;
if (config.logentriesEnabled) {
  const LogentriesClient = require('logentries-client');
  logentries = new LogentriesClient({
    token: config.logentriesToken
  });
}

const apiRoutes = require(path.join(__dirname, 'routes', 'api'));
const apiSystemRoutes = require(path.join(__dirname, 'routes', 'system'));
const txtwebRoutes = require(path.join(__dirname, 'routes', 'txtweb'));
const webRoutes = require(path.join(__dirname, 'routes', 'web'));

/*
 *  API Legacy is now deprecated
 */
const apiRoutesLegacy = require(path.join(__dirname, 'routes', 'api-legacy'));

const app = express();
// Express Logger
app.use(logger(config.expressLogLevel));

app.set('title', 'VITacademics');

// Static and Favicon
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Cookie Parser
app.use(cookieParser(config.expressSecretKey, {signed: true}));

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// New Relic in Template
if (config.newRelicEnabled) {
  app.locals.newrelic = newrelic;
}

// Google Analytics
app.use(ga(config.googleAnalyticsToken, {
  safe: true
}));

// Allow Cross-Origin Resource Sharing
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// MongoDB
const mongodbOptions = {
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

const mongodb;

const onConnect = function (err, db) {
  if (!err) {
    mongodb = db;
  }
  else {
    console.log('Failed to connect to MongoDB');
  }
}

mongoClient.connect(config.mongoDb, mongodbOptions, onConnect);

app.use(function (req, res, next) {
  req.db = mongo;
  next();
});

// RabbitMQ
/*
 const rabbit = jackrabbit(config.amqp_Uri);

 rabbit.queues = {
 main: 'Main',
 mobile: 'Mobile',
 share: 'Share'
 };

 app.use(function (req, res, next) {
 req.rabbit = rabbit.default();
 next();
 });
 */
 
// Routes
app.use('/', webRoutes);
app.use('/api/txtweb', txtwebRoutes);
app.use('/api/v2/system', apiSystemRoutes);
app.use('/api/v2/vellore', apiRoutes);
app.use('/api/v2/chennai', apiRoutes);

/*
 *  API Legacy is now deprecated
 */
app.use('/api/vellore', apiRoutesLegacy);
app.use('/api/chennai', apiRoutesLegacy);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
// Development error handler, will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    if (config.logentriesEnabled) {
      logentries.log('err', {Error: err, Message: err.message});
    }
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      status: err.status,
      stack: err.stack,
      googleAnalyticsToken: config.googleAnalyticsToken
    });
  });
}

// Production error handler, no stacktrace leaked to user
app.use(function (err, req, res, next) {
  if (config.logentriesEnabled) {
    logentries.log('err', {Error: err, Message: err.message});
  }
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    status: err.status,
    stack: '',
    googleAnalyticsToken: config.googleAnalyticsToken
  });
});

module.exports = app;
