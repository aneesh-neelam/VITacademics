/*
 *  VITacademics
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
                exam_schedule: 1
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

            let examScheduleUri;
            if (data.campus === "vellore") {
                examScheduleUri = "https://vtop.vit.ac.in/parent/exam_schedule.asp?sem=" + config.velloreSemesterCode;
            }
            else {
                examScheduleUri = "https://academicscc.vit.ac.in/parent/exam_schedule.asp?sem=" + config.chennaiSemesterCode;
            }
            const CookieJar = unirest.jar();
            const onPost = function (response) {
                // TODO - Write Scraper Functionality 
            };
            CookieJar.add(unirest.cookie(cookieSerial), examScheduleUri);
            unirest.post(examScheduleUri)
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