/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Ayush Agarwal <agarwalayush161@gmail.com>
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

const path = require('path');

const status = require(path.join(__dirname, '..', 'status'));
const config = require(path.join(__dirname, '..', 'config'));

let logentries;
if (config.logentriesEnabled) {
  const LogentriesClient = require('logentries-client');
  logentries = new LogentriesClient({
    token: config.logentriesToken
  });
}

exports.register = function (app, data, callback) {
  const collection = app.db.collection('student');
  const messaging = [];
  const doc = {
    type: data.type,
    id: data.id
  };
  messaging.push(doc);
  data.messaging = messaging;
  const onUpdate = function (err) {
    delete data.type;
    delete data.id;
    if (err) {
      data.status = status.mongoDown;
      console.log(JSON.stringify(data));
      callback(true, data);
    }
    else {
      data.status = status.success;
      callback(null, data);
    }
  };
  collection.findAndModify({reg_no: data.reg_no}, [
    ['reg_no', 'asc']
  ], {
    $set: {
      messaging: data.messaging
    }
  }, {safe: true, new: true, upsert: true}, onUpdate);
};
