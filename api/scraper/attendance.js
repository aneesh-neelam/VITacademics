/*
 *  VITacademics
 *  Copyright (C) 2014-2016  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014-2016  Ayush Agarwal <agarwalayush161@gmail.com>
 *  Copyright (C) 2014-2016  Karthik Balakrishnan <karthikb351@gmail.com>
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

const async = require('async');
const cache = require('memory-cache');
const cheerio = require('cheerio');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const path = require('path');
const unirest = require('unirest');

const status = require(path.join(__dirname, '..', '..', 'status'));


exports.scrapeAttendance = function (app, data, callback) {
  let attendanceUri;
  let attendanceDetailsUri;
  if (data.campus === 'vellore') {
    attendanceUri = 'https://academics.vit.ac.in/parent/attn_report.asp?sem=' + data.semester;
    attendanceDetailsUri = 'https://academics.vit.ac.in/parent/attn_report_details.asp';
  }
  else if (data.campus === 'chennai') {
    attendanceUri = 'http://academicscc.vit.ac.in/parent/attn_report.asp?sem=' + data.semester;
    attendanceDetailsUri = 'http://academicscc.vit.ac.in/parent/attn_report_details.asp';
  }
  const CookieJar = unirest.jar();
  const cookieSerial = cache.get(data.reg_no).cookie;
  const onRequest = function (response) {
    if (response.error) {
      callback(false, [
        status.vitDown
      ]);
    }
    else {
      const attendance = [];
      try {
        let scraper = cheerio.load(response.body);
        scraper = cheerio.load(scraper('table table').eq(1).html());
        const onEach = function (i, elem) {
          const htmlRow = cheerio.load(scraper(this).html());
          const htmlColumn = htmlRow('td');
          if (i > 0) {
            const classnbr = htmlRow('input[name=classnbr]').attr('value');
            attendance.push({
              class_number: parseInt(classnbr),
              course_code: htmlColumn.eq(1).text(),
              course_title: htmlColumn.eq(2).text(),
              course_type: htmlColumn.eq(3).text(),
              slot: htmlColumn.eq(4).text(),
              registration_date: momentTimezone.tz(htmlColumn.eq(5).text(), 'DD/MM/YYYY HH:mm:ss', 'Asia/Kolkata').utc().toJSON(),
              attended_classes: parseInt(htmlColumn.eq(6).text()),
              total_classes: parseInt(htmlColumn.eq(7).text()),
              attendance_percentage: parseInt(htmlColumn.eq(8).text().split('%')[0]),
              form: {
                semcode: htmlRow('input[name=semcode]').attr('value'),
                from_date: htmlRow('input[name=from_date]').attr('value'),
                to_date: htmlRow('input[name=to_date]').attr('value'),
                classnbr: classnbr
              }
            });
          }
        };
        scraper('tr').each(onEach);
        const doDetails = function (doc, asyncCallback) {
          const onPost = function (response) {
            if (response.error) {
              asyncCallback(false, [
                status.vitDown
              ]);
            }
            else {
              delete doc.form;
              try {
                let scraper = cheerio.load(response.body);
                scraper = cheerio.load(scraper('table table').eq(1).html());
                const details = [];
                const onDay = function (i, elem) {
                  const htmlColumn = cheerio.load(scraper(this).html())('td');
                  if (i > 1) {
                    details.push({
                      sl: parseInt(htmlColumn.eq(0).text()),
                      date: moment(htmlColumn.eq(1).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD'),
                      slot: htmlColumn.eq(2).text(),
                      status: htmlColumn.eq(3).text(),
                      class_units: parseInt(htmlColumn.eq(4).text()),
                      reason: htmlColumn.eq(5).text()
                    });
                  }
                };
                scraper('tr').each(onDay);
                doc.details = details;
              }
              catch (ex) {
                doc.details = [];
              }
              asyncCallback(null, doc);
            }
          };
          unirest.post(attendanceDetailsUri)
            .jar(CookieJar)
            .form(doc.form)
            .timeout(27000)
            .end(onPost);
        };
        async.map(attendance, doDetails, callback);
      }
      catch (ex) {
        callback(false, [
          status.dataParsing
        ]);
      }
    }
  };
  CookieJar.add(unirest.cookie(cookieSerial), attendanceUri);
  CookieJar.add(unirest.cookie(cookieSerial), attendanceDetailsUri);
  unirest.post(attendanceUri)
    .jar(CookieJar)
    .timeout(28500)
    .end(onRequest);
};
