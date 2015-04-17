/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
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

var cache = require('memory-cache');
var path = require('path');
var unirest = require('unirest');

var log;
if (process.env.LOGENTRIES_TOKEN) {
  let logentries = require('node-logentries');
  log = logentries.logger({
    token: process.env.LOGENTRIES_TOKEN
  });
}

var status = require(path.join(__dirname, '..', '..', 'status'));


exports.get = function (app, data, callback) {
  let captchaUri;
  if (data.campus === 'vellore') {
    captchaUri = 'https://academics.vit.ac.in/parent/captcha.asp';
  }
  else if (data.campus === 'chennai') {
    captchaUri = 'http://27.251.102.132/parent/captcha.asp';
  }
  var onRequest = function (response) {
    if (response.error) {
      data.status = status.vitDown;
      if (log) {
        log.log('debug', data);
      }
      console.log(JSON.stringify(data));
      callback(true, data);
    }
    else {
      let validity = 2; // In Minutes
      let key = Object.keys(response.cookies)[0];
      let cookieSerial = key + "=" + response.cookies[key];
      let doc = {
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
