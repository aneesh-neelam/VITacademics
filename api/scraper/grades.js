/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2015  Kishore Narendran <kishore.narendran09@gmail.com>
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
var cookie = require('cookie');
var moment = require('moment');
var path = require('path');
var unirest = require('unirest');

var log;
if (process.env.LOGENTRIES_TOKEN) {
  var logentries = require('node-logentries');
  log = logentries.logger({
    token: process.env.LOGENTRIES_TOKEN
  });
}

var status = require(path.join(__dirname, '..', 'status'));

exports.get = function (app, data, callback) {
  if (cache.get(data.reg_no) !== null) {
    if (cache.get(data.reg_no).dob === data.dob) {
      var collection = app.db.collection('student');
      var keys = {
        reg_no: 1,
        dob: 1,
        campus: 1,
        grades: 1,
        grade_summary: 1,
        credits_registered: 1,
        credits_earned: 1,
        cgpa: 1,
        semester_wise: 1,
        grades_refreshed: 1
      };

      var onFetch = function (err, mongoDoc) {
        if (err) {
          data.status = status.codes.mongoDown;
          if (log) {
            log.log('debug', data);
          }
          console.log(JSON.stringify(data));
          callback(true, data);
        }
        else if (mongoDoc) {
          delete mongoDoc['_id'];
          mongoDoc.status = status.codes.success;
          mongoDoc.cached = true;
          callback(false, mongoDoc);
        }
        else {
          data.status = status.codes.noData;
          callback(true, data);
        }
      };

      if (cache.get(data.reg_no).grades_refreshed) {
        collection.findOne({reg_no: data.reg_no, dob: data.dob, campus: data.campus}, keys, onFetch);
      }
      else {
        var gradesUri;
        if (data.campus === 'vellore') {
          gradesUri = 'https://academics.vit.ac.in/parent/student_history.asp';
        }
        else if (data.campus === 'chennai') {
          gradesUri = 'http://27.251.102.132/parent/student_history.asp';
        }

        var CookieJar = unirest.jar();
        var cookieSerial = cache.get(data.reg_no).cookie;

        var onRequest = function (response) {
          if (response.error) {
            data.status = status.codes.vitDown;
            if (log) {
              log.log('debug', data);
            }
            console.log(JSON.stringify(data));
            collection.findOne({reg_no: data.reg_no, dob: data.dob, campus: data.campus}, keys, onFetch);
          }
          else {
            var gradeValue = function (grade) {
              switch (grade) {
                case 'S':
                  return 10.00;

                case 'A':
                  return 9.00;

                case 'B':
                  return 8.00;

                case 'C':
                  return 7.00;

                case 'D':
                  return 6.00;

                case 'E':
                  return 5.00;

                case 'F':
                  return 0.00;

                case 'N':
                  return 0.00;
              }
            };
            var baseScraper = cheerio.load(response.body);
            data.grades = [];
            data.semester_wise = {};
            var onEach = function (i, elem) {
              if (i > 0) {
                var attrs = baseScraper(this).children('td');
                var exam_held = moment(attrs.eq(6).text(), 'MMM-YYYY').format('YYYY-MM');
                var grade = attrs.eq(5).text();
                var credits = parseInt(attrs.eq(4).text());
                data.grades.push({
                  'course_code': attrs.eq(1).text(),
                  'course_title': attrs.eq(2).text(),
                  'course_type': attrs.eq(3).text(),
                  'credits': credits,
                  'grade': grade,
                  'exam_held': exam_held,
                  'result_date': moment(attrs.eq(7).text(), 'DD-MMM-YYYY').isValid() ? moment(attrs.eq(7).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD') : null,
                  'option': attrs.eq(8).text()
                });
                if (gradeValue(grade)) {
                  if (data.semester_wise[exam_held]) {
                    var prev_credits = data.semester_wise[exam_held].credits;
                    data.semester_wise[exam_held].credits = prev_credits + credits;
                    data.semester_wise[exam_held].gpa = (((data.semester_wise[exam_held].gpa * prev_credits) + (gradeValue(grade) * credits)) / data.semester_wise[exam_held].credits).toFixed(2);
                  }
                  else {
                    data.semester_wise[exam_held] = {
                      credits: credits,
                      gpa: gradeValue(grade)
                    };
                  }
                }
              }
            };
            baseScraper('table #hist tr').each(onEach);

            // Scraping the credit summary
            var creditsTable = baseScraper('table table').eq(2).children('tr').eq(1);
            data.credits_registered = parseInt(creditsTable.children('td').eq(0).text());
            data.credits_earned = parseInt(creditsTable.children('td').eq(1).text());
            data.cgpa = parseFloat(creditsTable.children('td').eq(2).text().trim());

            // Scraping the grade summary information
            var gradeSummaryTable = baseScraper('table table').eq(3).children('tr').eq(1);
            data.grade_summary = {
              s: parseInt(gradeSummaryTable.children('td').eq(0).text()),
              a: parseInt(gradeSummaryTable.children('td').eq(1).text()),
              b: parseInt(gradeSummaryTable.children('td').eq(2).text()),
              c: parseInt(gradeSummaryTable.children('td').eq(3).text()),
              d: parseInt(gradeSummaryTable.children('td').eq(4).text()),
              e: parseInt(gradeSummaryTable.children('td').eq(5).text()),
              f: parseInt(gradeSummaryTable.children('td').eq(6).text()),
              n: parseInt(gradeSummaryTable.children('td').eq(7).text())
            };

            data.grades_refreshed = new Date().toJSON();
            data.cached = false;

            var onUpdate = function (err) {
              if (err) {
                data.status = status.codes.mongoDown;
                if (log) {
                  log.log('debug', data);
                }
                console.log(JSON.stringify(data));
                callback(true, data);
              }
              else {
                data.status = status.codes.success;
                var validity = 3; // In Minutes
                var doc = {
                  reg_no: data.reg_no,
                  dob: data.dob,
                  cookie: cookieSerial,
                  grades_refreshed: true
                };
                cache.put(data.reg_no, doc, validity * 60 * 1000);
                callback(null, data);
              }
            };

            collection.findAndModify({reg_no: data.reg_no}, [
              ['reg_no', 'asc']
            ], {
              $set: {
                grades: data.grades,
                grade_summary: data.grade_summary,
                credits_registered: data.credits_registered,
                credits_earned: data.credits_earned,
                cgpa: data.cgpa,
                semester_wise: data.semester_wise,
                grades_refreshed: data.grades_refreshed
              }
            }, {safe: true, new: true, upsert: true}, onUpdate);
          }
        };

        CookieJar.add(unirest.cookie(cookieSerial), gradesUri);
        unirest.post(gradesUri)
          .jar(CookieJar)
          .timeout(28000)
          .end(onRequest);
      }
    }
    else {
      data.status = status.codes.invalid;
      callback(true, data);
    }
  }
  else {
    data.status = status.codes.timedOut;
    callback(null, data);
  }
};
