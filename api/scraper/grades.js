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

function gradeValue(grade) {
    switch(grade) {
      case 'S':
        return 10;

      case 'A':
        return 9;

      case 'B':
        return 8;

      case 'C':
        return 7;

      case 'D':
        return 6;

      case 'E':
        return 5;

      case 'F':
        return 0;

      case 'N':
        return 0;
    }
}

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
            var baseScraper = cheerio.load(response.body);
            data.grades = [];
            var examHeldCollection = [];
            var semesterWiseGrades = {};
            var onEach = function (i, elem) {
              var attrs = baseScraper(this).children('td');
              data.grades.push({
                'course_code': attrs.eq(1).text(),
                'course_title': attrs.eq(2).text(),
                'course_type': attrs.eq(3).text(),
                'credits': parseInt(attrs.eq(4).text()),
                'grade': attrs.eq(5).text(),
                'exam_held': moment(attrs.eq(6).text(), 'MMM-YYYY').format('YYYY-MM'),
                'result_date': moment(attrs.eq(7).text(), 'DD-MMM-YYYY').isValid() ? moment(attrs.eq(7).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD') : null,
                'option': attrs.eq(8).text()
              });
              var examHeld = moment(attrs.eq(6).text()).format('YYYY-MM');
              if(!(examHeldCollection.indexOf(examHeld) > -1)) {
                examHeldCollection.push(examHeld);
              }
              semesterWiseGrades[examHeld] = [];
            };
            baseScraper('table #hist tr').each(onEach);

            //Removing the column headers from the data
            examHeldCollection.shift();
            data.grades.shift();
            delete semesterWiseGrades["Invalid date"];

            //Pushing necessary credits and grade information to evaluate the semester wise GPA
            for(var i = 0; i < data.grades.length; i++) {
              var course = data.grades[i];
              var semesterGrades = semesterWiseGrades[course.exam_held];
              semesterGrades.push({'credits': course.credits, 'grade': course.grade});
              semesterWiseGrades[course.exam_held] = semesterGrades;
            }

            //Calculating the semester wise GPA
            for(var i = 0; i < examHeldCollection.length; i++) {
              var semesterWiseGrade = semesterWiseGrades[examHeldCollection[i]];
              var gpa = 0;
              var credits = 0;
              for(var j = 0; j < semesterWiseGrade.length; j++) {
                var course = semesterWiseGrade[j];
                if(course['grade'] != 'W' && course['grade'] != 'U') {
                  gpa += (course['credits'] * gradeValue(course['grade']));
                  credits += course['credits']
                }
              }
              semesterWiseGrades[examHeldCollection[i]] = parseFloat((gpa/credits).toFixed(2));
            }
            data.semester_wise_gpa = semesterWiseGrades;

            // Scraping the credit information
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
                semester_wise_cgpa: data.semester_wise_gpa,
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
