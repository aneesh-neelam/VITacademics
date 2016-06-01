/*
 *  VITacademics
 *  Copyright (C) 2014-2016  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014-2016  Ayush Agarwal <agarwalayush161@gmail.com>
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

exports.get = function (app, data, callback) {
  let collection = app.db.collection('faculty');
  const keys = {
    name: 1,
    room: 1,
    email: 1,
    school: 1,
    open_hours: 1
  };
  const onSearch = function (err, doc) {
    if (!err) {
      if (doc) {
        doc.status = status.success;
      }
      else {
        doc.status = status.noData;
      }
      delete doc._id;
      callback(null, doc);
    }
    else {
      data.status = status.mongoDown;
      if (config.logentriesEnabled) {
        logentries.log('crit', data);
      }
      console.log(JSON.stringify(data));
      callback(true, data);
    }
  };
  collection.findOne({name: data.name}, keys, onSearch);
};
