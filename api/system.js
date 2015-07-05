/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Aneesh Neelam <neelam.aneesh@gmail.com>
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

var async = require('async');
var path = require('path');

var config = require(path.join(__dirname, '..', 'config'));

var logentries;
if (config.logentriesEnabled) {
  let LogentriesClient = require('logentries-client');
  logentries = new LogentriesClient({
    token: config.logentriesToken
  });
}

var status = require(path.join(__dirname, '..', 'status'));


exports.get = function (app, data, callback) {
  var clientCollection = app.db.collection('client');
  var messageCollection = app.db.collection('message');
  var contributorCollection = app.db.collection('contributor');
  let parallelTasks = {
    client: function (asyncCallback) {
      let keys = {
        android: 1,
        ios: 1,
        windows: 1
      };
      clientCollection.findOne({}, keys, asyncCallback);
    },
    messages: function (asyncCallback) {
      messageCollection.find({}, {limit: 10, sort: [['_id', 'desc']]}).toArray(asyncCallback);
    },
    contributors: function (asyncCallback) {
      contributorCollection.find().toArray(asyncCallback);
    }
  };
  var onFetch = function (err, results) {
    if (err) {
      data.status = status.mongoDown;
      if (config.logentriesEnabled) {
        logentries.log('crit', data);
      }
      console.log(data.status);
      callback(true, data);
    }
    else if (results.client && results.messages && results.contributors) {
      data.android = results.client.android;
      data.ios = results.client.ios;
      data.windows = results.client.windows;
      data.messages = results.messages;
      data.contributors = results.contributors;
      data.status = status.success;
      callback(false, data);
    }
    else {
      data.status = status.noData;
      if (config.logentriesEnabled) {
        logentries.log('alert', data);
      }
      console.log(data.status);
      callback(true, data);
    }
  };
  async.parallel(parallelTasks, onFetch);
};
