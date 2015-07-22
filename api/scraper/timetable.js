/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014-2015  Saurabh Joshi <battlex94@gmail.com>
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

const cache = require('memory-cache');
const cheerio = require('cheerio');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const path = require('path');
const unirest = require('unirest');

const status = require(path.join(__dirname, '..', '..', 'status'));

const day = require(path.join(__dirname, '..', '..', 'utilities', 'day'));

exports.scrapeTimetable = function (app, data, callback) {
  let timetableUri;
  if (data.campus === 'vellore') {
    timetableUri = 'https://academics.vit.ac.in/parent/timetable.asp?sem=' + data.semester;
  }
  else if (data.campus === 'chennai') {
    timetableUri = 'http://27.251.102.132/parent/timetable.asp?sem=' + data.semester;
  }
  const CookieJar = unirest.jar();
  const cookieSerial = cache.get(data.reg_no).cookie;
  const onRequest = function (response) {
    if (response.error) {
      data.status = status.vitDown;
      callback(true, data);
    }
    else {
      const timetable = {
        courses: [],
        withdrawn_courses: [],
        timings: []
      };
      try {
        const baseScraper = cheerio.load(response.body);

        let timetableScraper;
        let withdrawnScraper;
        let coursesScraper;

        if (baseScraper('b').eq(1).text().substring(0, 2) === 'No') {
          coursesScraper = null;
          withdrawnScraper = null;
          timetableScraper = null;
        }
        else if (baseScraper('table table').length == 3) {
          coursesScraper = cheerio.load(baseScraper('table table').eq(0).html());
          withdrawnScraper = cheerio.load(baseScraper('table table').eq(1).html());
          timetableScraper = cheerio.load(baseScraper('table table').eq(2).html());
        }
        else if (baseScraper('table table').length == 2) {
          coursesScraper = cheerio.load(baseScraper('table table').eq(0).html());
          withdrawnScraper = null;
          timetableScraper = cheerio.load(baseScraper('table table').eq(1).html());
        }

        const tmp = {};
        const slotTimings = {
          theory: {},
          lab: {}
        };

        if (coursesScraper) {
          const length = coursesScraper('tr').length;
          const onEachCourse = function (i, elem) {
            if (i > 0 && i < (length - 1)) {
              const htmlColumn = cheerio.load(coursesScraper(this).html())('td');
              const classnbr = parseInt(htmlColumn.eq(1).text());
              let code = htmlColumn.eq(2).text();
              const courseType = htmlColumn.eq(4).text();
              const columns = htmlColumn.length;
              let slot = null;
              let venue = null;
              let faculty = null;
              let registrationStatus = null;
              let bill = null;
              let billDate = null;
              let billNumber = null;
              let projectTitle = null;
              if (columns === 13) {
                slot = htmlColumn.eq(8).text();
                venue = htmlColumn.eq(9).text();
                faculty = htmlColumn.eq(10).text();
                registrationStatus = htmlColumn.eq(11).text();
                bill = htmlColumn.eq(12).text().split(' / ');
                billDate = moment(bill[1], 'DD/MM/YYYY').isValid() ? moment(bill[1], 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
                billNumber = parseInt(bill[0]);
              }
              else if (columns === 12) {
                projectTitle = htmlColumn.eq(8).text().split(':')[1];
                faculty = htmlColumn.eq(9).text().split(':')[1];
                registrationStatus = htmlColumn.eq(10).text();
                bill = htmlColumn.eq(11).text().split(' / ');
                billDate = moment(bill[1], 'DD/MM/YYYY').isValid() ? moment(bill[1], 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
                billNumber = parseInt(bill[0]);
              }
              if (courseType === 'Embedded Theory') {
                code = code + 'ETH';
              }
              else if (courseType === 'Embedded Lab') {
                code = code + 'ELA';
              }
              else if (courseType === 'Theory Only') {
                code = code + 'TH';
              }
              else if (courseType === 'Lab Only') {
                code = code + 'LO';
              }
              tmp[code] = classnbr;
              timetable['courses'].push({
                class_number: classnbr,
                course_code: htmlColumn.eq(2).text(),
                course_title: htmlColumn.eq(3).text(),
                subject_type: courseType,
                ltpc: htmlColumn.eq(5).text().replace(/[^a-zA-Z0-9]/g, ''),
                course_mode: htmlColumn.eq(6).text(),
                course_option: htmlColumn.eq(7).text(),
                slot: slot,
                venue: venue,
                faculty: faculty,
                registration_status: registrationStatus,
                bill_date: billDate,
                bill_number: billNumber,
                project_title: projectTitle
              });
            }
          };
          coursesScraper('tr').each(onEachCourse);
        }

        if (withdrawnScraper) {
          const length = withdrawnScraper('tr').length;
          const onEachWithdrawn = function (i, elem) {
            if (i > 0 && i < length) {
              const htmlColumn = cheerio.load(withdrawnScraper(this).html())('td');
              timetable['withdrawn_courses'].push({
                class_number: parseInt(htmlColumn.eq(1).text()),
                course_code: htmlColumn.eq(2).text(),
                course_title: htmlColumn.eq(3).text(),
                subject_type: htmlColumn.eq(4).text(),
                ltpc: htmlColumn.eq(5).text().replace(/[^a-zA-Z0-9]/g, ''),
                course_mode: htmlColumn.eq(6).text()
              });
            }
          };
          withdrawnScraper('tr').each(onEachWithdrawn);
        }

        if (timetableScraper) {
          let timingsPerDay;
          const onEachRow = function (i, elem) {
            const htmlRow = cheerio.load(timetableScraper(this).html());
            const htmlColumn = htmlRow('td');
            const CellOneWords = htmlColumn.eq(0).text().split(' ');
            let jump, diff;
            if (CellOneWords[CellOneWords.length - 1] === 'HOURS') {
              diff = 0;
              for (let elt = 1; elt < htmlColumn.length; elt++) {
                const col = elt + diff;
                timingsPerDay = col;
                if (htmlColumn.eq(elt).attr('bgcolor') === '#C0C0C0' || htmlColumn.eq(elt).attr('bgcolor') === '#999966') {
                  diff = diff - 1;
                }
                else {
                  momentTimezone.tz.setDefault("Asia/Kolkata");
                  const text = htmlColumn.eq(elt).text();
                  const times = text.split('to');
                  const startTime = moment(times[0], 'hh:mm A').isValid() ? momentTimezone.tz(times[0], 'hh:mm A', "Asia/Kolkata").utc().format('HH:mm:ss') + 'Z' : null;
                  const endTime = moment(times[1], 'hh:mm A').isValid() ? momentTimezone.tz(times[1], 'hh:mm A', "Asia/Kolkata").utc().format('HH:mm:ss') + 'Z' : null;
                  const slotType = i === 0 ? 'theory' : 'lab';
                  slotTimings[slotType][col] = {
                    start_time: startTime,
                    end_time: endTime
                  };
                }
              }
            }
            else {
              if (timingsPerDay === htmlColumn.length - 1 || timingsPerDay === htmlColumn.length) {
                jump = 1;
                diff = 0;
              }
              else {
                jump = 2;
                diff = 1;
              }
              let last = null;
              for (let elt = 1; elt < htmlColumn.length; ++elt) {
                const text = htmlColumn.eq(elt).text().split(' ');
                const sub = text[0] + text[2];
                if (tmp[sub]) {
                  const slotType = (text[2] === 'TH' || text[2] === 'ETH') ? 'theory' : 'lab';
                  const startTime = slotTimings[slotType][elt * jump - diff] ? (slotTimings[slotType][elt * jump - diff].start_time) : (slotTimings['theory'][elt * jump - diff].start_time || slotTimings['lab'][elt * jump - diff].start_time);
                  let endTime;
                  if (day.getCodeFromText(CellOneWords[0]) === 4 && htmlColumn.length === timingsPerDay && elt === 9) {
                    endTime = slotTimings[slotType][elt * jump + 1] ? slotTimings[slotType][elt * jump + 1].end_time : (slotTimings['theory'][elt * jump + 1].end_time || slotTimings['lab'][elt * jump + 1].end_time);
                  }
                  else {
                    endTime = slotTimings[slotType][elt * jump] ? slotTimings[slotType][elt * jump].end_time : (slotTimings['theory'][elt * jump].end_time || slotTimings['lab'][elt * jump].end_time);
                  }
                  if (last) {
                    if (last.class_number === tmp[sub] && last.day === day.getCodeFromText(CellOneWords[0]) && slotType === 'lab') {
                      last.end_time = endTime;
                    }
                    else {
                      timetable.timings.push(last);
                      last = {
                        class_number: tmp[sub],
                        day: day.getCodeFromText(CellOneWords[0]),
                        start_time: startTime,
                        end_time: endTime
                      };
                    }
                  }
                  else {
                    last = {
                      class_number: tmp[sub],
                      day: day.getCodeFromText(CellOneWords[0]),
                      start_time: startTime,
                      end_time: endTime
                    };
                  }

                }
                else {
                  if (last) {
                    timetable.timings.push(last);
                    last = null;
                  }
                }
              }
            }
          };
          timetableScraper('tr').each(onEachRow);
        }
        timetable.status = status.success;
        callback(null, timetable);
      }
      catch (ex) {
        data.status = status.dataParsing;
        callback(true, data);
      }
    }
  };
  CookieJar.add(unirest.cookie(cookieSerial), timetableUri);
  unirest.post(timetableUri)
    .jar(CookieJar)
    .timeout(28000)
    .end(onRequest);
};
