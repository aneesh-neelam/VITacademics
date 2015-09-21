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

const cache = require('memory-cache');
const path = require('path');

const config = require(path.join(__dirname, '..', '..', 'config'));

let logentries;
if (config.logentriesEnabled) {
  const LogentriesClient = require('logentries-client');
  logentries = new LogentriesClient({
    token: config.logentriesToken
  });
}

const status = require(path.join(__dirname, '..', '..', 'status'));


exports.get = function (app, data, callback) {
  const collection = app.db.collection('student');
  const keys = {
    reg_no: 1,
    dob: 1,
    mobile: 1,
    courses: 1,
    campus: 1,
    semester: 1,
    refreshed: 1
  };
  const onFetch = function (err, doc) {
    if (err) {
      data.status = status.mongoDown;
      if (config.logentriesEnabled) {
        logentries.log('crit', data);
      }
      console.log(JSON.stringify(data));
      callback(true, {status: status.mongoDown});
    }
    else if (doc) {
      if (doc.courses) {
        const forEachCourse = function (elt, i, arr) {
          delete elt.attendance;
          delete elt.marks;
          delete elt.registration_status;
          delete elt.bill_date;
          delete elt.bill_number;
        };
        delete doc._id;
        doc.courses.forEach(forEachCourse);
        doc.status = status.success;
        app.rabbit.publish({receiver: data.receiver, owner: doc.reg_no}, {name: app.rabbit.queues.share});
        callback(false, doc);
      }
      else {
        data.status = status.noData;
        callback(false, data);
      }
    }
    else {
      data.status = status.noData;
      callback(false, data);
    }
  };
  if (data.token) {
    if (cache.get(data.token)) {
      collection.findOne({reg_no: cache.get(data.token), campus: data.campus}, keys, onFetch);
    }
    else {
      data.status = status.tokenExpired;
      callback(false, data);
    }
  }
  else {
    collection.findOne({reg_no: data.reg_no, dob: data.dob, mobile: data.mobile, campus: data.campus}, keys, onFetch);
  }
};
