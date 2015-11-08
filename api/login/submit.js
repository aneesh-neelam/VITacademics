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
const cheerio = require('cheerio');
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
  if (cache.get(data.reg_no) !== null) {
    const CookieJar = unirest.jar();
    const cookieSerial = cache.get(data.reg_no).cookie;
    let submitUri;
    if (data.campus === 'vellore') {
      submitUri = 'https://academics.vit.ac.in/parent/parent_login_submit.asp';
    }
    else if (data.campus === 'chennai') {
      submitUri = 'http://27.251.102.132/parent/parent_login_submit.asp';
    }
    CookieJar.add(unirest.cookie(cookieSerial), submitUri);
    const onPost = function (response) {
      delete data['captcha'];
      if (response.error) {
        data.status = status.vitDown;
        if (config.logentriesEnabled) {
          logentries.log('crit', data);
        }
        console.log(data.status);
        callback(true, data);
      }
      else {
        try {
          const scraper = cheerio.load(response.body);
          const htmlTable = cheerio.load(scraper('table').eq(1).html());
          const texts = htmlTable('td font').eq(0).text().split(' - ');
          const reg = texts[0].replace(/[^a-zA-Z0-9]/g, '');
          if (reg === data.reg_no) {
            data.name = texts[1].trim();
            const validity = 3; // In Minutes
            const doc = {
              reg_no: data.reg_no,
              dob: data.dob,
              mobile: data.mobile,
              cookie: cookieSerial
            };
            cache.put(data.reg_no, doc, validity * 60 * 1000);
            const onUpdate = function (err) {
              if (err) {
                data.status = status.mongoDown;
                if (config.logentriesEnabled) {
                  logentries.log('crit', data);
                }
                console.log(data.status);
                callback(true, data);
              }
              else {
                data.status = status.success;
                callback(null, data);
              }
            };
            const collection = app.db.collection('student');
            collection.findAndModify({reg_no: data.reg_no}, [
              ['reg_no', 'asc']
            ], {$set: {name: data.name, dob: data.dob, mobile: data.mobile, campus: data.campus}}, {
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
        wdregno: data.reg_no,
        wdpswd: data.dob,
        wdmobno: data.mobile,
        vrfcd: data.captcha
      })
      .timeout(28000)
      .end(onPost);
  }
  else {
    data.status = status.timedOut;
    callback(null, data);
  }
};
