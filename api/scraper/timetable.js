/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2015  Saurabh Joshi <battlex94@gmail.com>
 *  Copyright (C) 2015  Ayush Agarwal <agarwalayush161@gmail.com>
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
var moment = require('moment');
var momentTimezone = require('moment-timezone');
var path = require('path');
var unirest = require('unirest');

var status = require(path.join(__dirname, '..', '..', 'status'));
var timetableResource = require(path.join(__dirname, '..', 'timetable-resource'));


exports.scrapeTimetable = function (app, data, callback) {
  var timetableUri;
  if (data.campus === 'vellore') {
    timetableUri = 'https://academics.vit.ac.in/parent/timetable.asp?sem=' + data.semester;
  }
  else if (data.campus === 'chennai') {
    timetableUri = 'http://27.251.102.132/parent/timetable.asp?sem=' + data.semester;
  }
  var CookieJar = unirest.jar();
  var cookieSerial = cache.get(data.reg_no).cookie;
  var onRequest = function (response) {
    if (response.error) {
      data.status = status.vitDown;
      callback(true, data);
    }
    else {
      var timetable = {
        courses: [],
        withdrawn_courses: [],
        timings: []
      };
      try {
        var baseScraper = cheerio.load(response.body);
        var timetableScraper;
        var withdrawnScraper;
        var coursesScraper;
        if (baseScraper('b').eq(1).text().substring(0, 2) === 'No') {
          timetable.timetable = timetableResource.emptyTimetable;
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
        var tmp = {};
        if (coursesScraper) {
          var length = coursesScraper('tr').length;
          var onEachCourse = function (i, elem) {
            if (i > 0 && i < (length - 1)) {
              var htmlColumn = cheerio.load(coursesScraper(this).html())('td');
              var classnbr = parseInt(htmlColumn.eq(1).text());
              var code = htmlColumn.eq(2).text();
              var courseType = htmlColumn.eq(4).text();
              var columns = htmlColumn.length;
              var slot = null;
              var venue = null;
              var faculty = null;
              var registrationStatus = null;
              var bill;
              var billDate = null;
              var billNumber = null;
              var projectTitle = null;
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
              if (courseType == 'Embedded Theory') {
                code = code + 'ETH';
              }
              else if (courseType == 'Embedded Lab') {
                code = code + 'ELA';
              }
              else if (courseType == 'Theory Only') {
                code = code + 'TH';
              }
              else if (courseType == 'Lab Only') {
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
          length = withdrawnScraper('tr').length;
          var onEachWithdrawn = function (i, elem) {
            if (i > 0 && i < length) {
              var htmlColumn = cheerio.load(withdrawnScraper(this).html())('td');
              timetable['withdrawn_courses'].push({
                class_number: htmlColumn.eq(1).text(),
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
          length = timetableScraper('tr').length;
          var onEachRow = function (i, elem) {
            var htmlRow = cheerio.load(timetableScraper(this).html());
            var getSlotTimings = function (column, isTheory, isEndTime) {
              var morningStartHour = 8;
              momentTimezone.tz.setDefault("Asia/Kolkata");
              var time = new momentTimezone();
              column = column - 1;
              if (isTheory) {
                if (isEndTime) {
                  time.set({minute: 50, second: 0});
                }
                else {
                  time.set({minute: 0, second: 0});
                }
                if (column < 12) {
                  time.set({hour: morningStartHour + column, second: 0});
                }
                else {
                  time.set({hour: morningStartHour + column - 1, second: 0});
                }
              }
              else {
                if (column < 12 && (column % 6) < 4) {
                  if (isEndTime) {
                    time.set({hour: morningStartHour + column, minute: 50, second: 0});
                  }
                  else {
                    time.set({hour: morningStartHour + column, minute: 0, second: 0});
                  }
                }
                else if (column == 12) {
                  if (isEndTime) {
                    time.set({hour: morningStartHour + column, minute: 20, second: 0});
                  }
                  else {
                    time.set({hour: morningStartHour + column - 1, minute: 30, second: 0});
                  }
                }
                else if (column == 13) {
                  if (isEndTime) {
                    time.set({hour: morningStartHour + column, minute: 10, second: 0});
                  }
                  else {
                    time.set({hour: morningStartHour + column - 1, minute: 20, second: 0});
                  }
                }
                else {
                  if (isEndTime) {
                    if ((column % 6) === 5) {
                      time.set({hour: morningStartHour + column, minute: 30, second: 0});
                    }
                    else {
                      time.set({hour: morningStartHour + column, minute: 40, second: 0});
                    }
                  }
                  else {
                    if ((column % 6) === 4) {
                      time.set({hour: morningStartHour + column - 1, minute: 50, second: 0});
                    }
                    else {
                      time.set({hour: morningStartHour + column - 1, minute: 40, second: 0});
                    }
                  }
                }
              }
              return (momentTimezone.tz(time, "Asia/Kolkata").utc().format('HH:mm:ss') + 'Z');
            };
            if (i > 1) {
              var htmlColumn = htmlRow('td');
              length = htmlColumn.length;
              var last = null;
              for (var elt = 1; elt < length; elt++) {
                var text = htmlColumn.eq(elt).text().split(' ');
                var sub = text[0] + text[2];
                if (tmp[sub]) {
                  var course_type = (text[2] === 'TH' || text[2] === 'ETH');
                  if (last) {
                    if (last.class_number === tmp[sub] && last.day === (i - 2)) {
                      last.end_time = getSlotTimings(elt, course_type, true);
                    }
                    else {
                      timetable.timings.push(last);
                      last = {
                        class_number: tmp[sub],
                        start_time: getSlotTimings(elt, course_type, false),
                        end_time: getSlotTimings(elt, course_type, true),
                        day: (i - 2)
                      };
                    }
                  }
                  else {
                    last = {
                      class_number: tmp[sub],
                      start_time: getSlotTimings(elt, course_type, false),
                      end_time: getSlotTimings(elt, course_type, true),
                      day: (i - 2)
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
        data.status = status.invalid;
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
