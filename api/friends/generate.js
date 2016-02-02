/*
 *  VITacademics
 *  Copyright (C) 2014-2016  Aneesh Neelam <neelam.aneesh@gmail.com>
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

const cache = require('memory-cache');
const path = require('path');
const underscore = require('underscore');

const config = require(path.join(__dirname, '..', '..', 'config'));

let logentries;
if (config.logentriesEnabled) {
  const LogentriesClient = require('logentries-client');
  logentries = new LogentriesClient({
    token: config.logentriesToken
  });
}

const status = require(path.join(__dirname, '..', '..', 'status'));
const resource = require(path.join(__dirname, '..', 'token-resource'));


const generate = function (regNo, validity, callback) {
  let token;
  do
  {
    token = underscore.sample(resource.resources, 6).join('');
  }
  while (cache.get(token));
  cache.put(token, regNo, validity * 60 * 60 * 1000);
  callback(null, token);
};

exports.get = function (app, data, callback) {
  const collection = app.db.collection('student');
  const onFetch = function (err, doc) {
    if (err) {
      data.status = status.mongoDown;
      if (config.logentriesEnabled) {
        logentries.log('crit', data);
      }
      callback(true, data);
    }
    if (doc) {
      const validity = 24; // In Hours
      const onGeneration = function (err, token) {
        data.share = {
          token: token,
          validity: validity,
          issued: new Date().toJSON()
        };
        data.status = status.success;
        callback(err, data);
      };
      generate(data.reg_no, validity, onGeneration);
    }
    else {
      data.status = status.invalid;
      callback(false, data);
    }
  };
  collection.findOne({reg_no: data.reg_no, dob: data.dob, mobile: data.mobile, campus: data.campus}, onFetch);
};
