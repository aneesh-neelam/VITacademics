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
const unirest = require('unirest');

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
  let captchaUri;
  if (data.campus === 'vellore') {
    captchaUri = 'https://academics.vit.ac.in/parent/captcha.asp';
  }
  else if (data.campus === 'chennai') {
    captchaUri = 'http://academicscc.vit.ac.in/parent/captcha.asp';
  }
  const onRequest = function (response) {
    if (response.error) {
      data.status = status.vitDown;
      if (config.logentriesEnabled) {
        logentries.log('crit', data);
      }
      console.log(JSON.stringify(data));
      callback(true, data);
    }
    else {
      const validity = 2; // In Minutes
      const key = Object.keys(response.cookies)[0];
      const cookieSerial = key + "=" + response.cookies[key];
      const doc = {
        reg_no: data.reg_no,
        cookie: cookieSerial
      };
      cache.put(data.reg_no, doc, validity * 60 * 1000);
      callback(null, response.body);
    }
  };
  unirest.get(captchaUri)
    .encoding(null)
    .timeout(26000)
    .end(onRequest);
};
