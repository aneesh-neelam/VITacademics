/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014-2015  Karthik Balakrishnan <karthikb351@gmail.com>
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

var path = require('path');

var config = require(path.join(__dirname, '..', '..', 'config'));

var captchaParser = require(path.join(__dirname, 'captcha-parser'));

var logentries;
if (config.logentriesEnabled) {
  let LogentriesClient = require('logentries-client');
  logentries = new LogentriesClient({
    token: config.logentriesToken
  });
}

var login = require(path.join(__dirname, 'get'));
var status = require(path.join(__dirname, '..', '..', 'status'));
var submit = require(path.join(__dirname, 'submit'));


exports.get = function (app, data, callback) {
  var parseCaptcha = function (err, captchaImage) {
    if (err) {
      callback(true, captchaImage);
    }
    else {
      try {
        data.captcha = captchaParser.parseBuffer(captchaImage);
      }
      catch (ex) {
        data.status = status.captchaParsing;
        if (config.logentriesEnabled) {
          logentries.log('err', data);
        }
        console.log(data.status);
        callback(true, data);
      }
      submit.get(app, data, callback);
    }
  };
  login.get(app, data, parseCaptcha);
};
