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

const cheerio = require('cheerio');
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
  if (cache.get(data.reg_no) !== null) {
    const collection = app.db.collection('student');
    const cacheDoc = cache.get(data.reg_no);
    const cookieSerial = cache.get(data.reg_no).cookie;
    if (cacheDoc.dob === data.dob && cacheDoc.mobile === data.mobile) {
      const keys = {
        reg_no: 1,
        dob: 1,
        mobile: 1,
        campus: 1,
        advisor: 1
      };

      const onFetch = function (err, mongoDoc) {
        if (err) {
          data.status = status.mongoDown;
          if (config.logentriesEnabled) {
            logentries.log('crit', data);
          }
          console.log(JSON.stringify(data));
          callback(true, data);
        }
        else if (mongoDoc) {
          delete mongoDoc['_id'];
          mongoDoc.status = status.success;
          mongoDoc.cached = true;
          callback(false, mongoDoc);
        }
        else {
          data.status = status.noData;
          callback(true, data);
        }
      };

      let advisorUri;
      if (data.campus === 'vellore') {
        advisorUri = 'https://academics.vit.ac.in/parent/fa_view.asp';
      }
      else {
        advisorUri = 'http://27.251.102.132/parent/proctor_view.asp';
      }
      const CookieJar = unirest.jar();
      const onPost = function (response) {
        if (response.error) {
          data.status = status.vitDown;
          if (config.logentriesEnabled) {
            logentries.log('crit', data);
          }
          console.log(JSON.stringify(data));
          collection.findOne({reg_no: data.reg_no, dob: data.dob, campus: data.campus}, keys, onFetch);
        }
        else {
          const faculty = {};
          try {
            let scraper = cheerio.load(response.body);
            scraper = cheerio.load(scraper('table table').eq(0).html());

            let row = cheerio.load(scraper('tr').eq(1).html());
            faculty['name'] = row('td').eq(1).text();
            row = cheerio.load(scraper('tr').eq(2).html());
            faculty['designation'] = row('td').eq(1).text();
            row = cheerio.load(scraper('tr').eq(3).html());
            faculty['school'] = row('td').eq(1).text();
            row = cheerio.load(scraper('tr').eq(4).html());
            faculty['division'] = row('td').eq(1).text();
            row = cheerio.load(scraper('tr').eq(5).html());
            faculty['phone'] = row('td').eq(1).text();
            row = cheerio.load(scraper('tr').eq(6).html());
            faculty['email'] = row('td').eq(1).text();
            row = cheerio.load(scraper('tr').eq(7).html());
            faculty['cabin'] = row('td').eq(1).text();
            row = cheerio.load(scraper('tr').eq(8).html());
            faculty['intercom'] = row('td').eq(1).text();
          }
          catch (ex) {
            faculty.name = null,
            faculty.designation = null,
            faculty.school = null,
            faculty.division = null,
            faculty.phone = null,
            faculty.email = null,
            faculty.cabin = null,
            faculty.intercom = null
          }
          finally {
            data.status = status.success;
            data.advisor = faculty;
            callback(null, data);
            data.cached = false;
            const onUpdate = function (err) {
              if (err) {
                data.status = status.mongoDown;
                if (config.logentriesEnabled) {
                  logentries.log('crit', data);
                }
                console.log(JSON.stringify(data));
                callback(true, data);
              }
              else {
                data.status = status.success;
                const validity = 3;
                const doc = {
                  reg_no: data.reg_no,
                  dob: data.dob,
                  mobile: data.mobile,
                  cookie: cookieSerial
                };
                cache.put(data.reg_no, doc, validity * 60 * 1000);
                callback(null, data);
              }
            };
            collection.findAndModify({reg_no: data.reg_no}, [
              ['reg_no', 'asc']
            ], {
              $set: {
                advisor: data.advisor
              }
            }, {safe: true, new: true, upsert: true}, onUpdate);
          }
        }
      };
      CookieJar.add(unirest.cookie(cookieSerial), advisorUri);
      unirest.post(advisorUri)
        .jar(CookieJar)
        .end(onPost);
    }
    else {
      data.status = status.invalid;
      callback(null, data);
    }
  }
  else {
    data.status = status.timedOut;
    callback(null, data);
  }
};
