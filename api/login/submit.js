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
var cheerio = require('cheerio');
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
  if (cache.get(data.reg_no) !== null) {
    var CookieJar = unirest.jar();
    let cookieSerial = cache.get(data.reg_no).cookie;
    let submitUri;
    if (data.campus === 'vellore') {
      submitUri = 'https://academics.vit.ac.in/parent/parent_login_submit.asp';
    }
    else if (data.campus === 'chennai') {
      submitUri = 'http://27.251.102.132/parent/parent_login_submit.asp';
    }
    CookieJar.add(unirest.cookie(cookieSerial), submitUri);
    var onPost = function (response) {
      delete data['captcha'];
      if (response.error) {
        data.status = status.vitDown;
        if (log) {
          log.log('debug', data);
        }
        console.log(data.status);
        callback(true, data);
      }
      else {
        try {
          var scraper = cheerio.load(response.body);
          var htmlTable = cheerio.load(scraper('table').eq(1).html());
          let text = htmlTable('td font').eq(0).text();
          text = text.split(' - ')[0].replace(/[^a-zA-Z0-9]/g, '');
          if (text === data.reg_no) {
            let validity = 3; // In Minutes
            let doc = {
              reg_no: data.reg_no,
              dob: data.dob,
              cookie: cookieSerial
            };
            cache.put(data.reg_no, doc, validity * 60 * 1000);
            var onUpdate = function (err) {
              if (err) {
                data.status = status.mongoDown;
                if (log) {
                  log.log('debug', data);
                }
                console.log(data.status);
                callback(true, data);
              }
              else {
                data.status = status.success;
                callback(null, data);
              }
            };
            var collection = app.db.collection('student');
            collection.findAndModify({reg_no: data.reg_no}, [
              ['reg_no', 'asc']
            ], {$set: {dob: data.dob, campus: data.campus}}, {
              safe: true,
              new: true,
              upsert: true
            }, onUpdate);
          }
          else {
            data.status = status.invalid;
            console.log(JSON.stringify(data));
            callback(null, data);
          }
        }
        catch (ex) {
          data.status = status.dataParsing;
          callback(null, data);
        }
      }
    };
    unirest.post(submitUri)
      .jar(CookieJar)
      .form({
        'wdregno': data.reg_no,
        'wdpswd': data.dob,
        'vrfcd': data.captcha
      })
      .timeout(28000)
      .end(onPost);
  }
  else {
    data.status = status.timedOut;
    callback(null, data);
  }
};
