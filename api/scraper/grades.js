/*
 *  VITacademics
 *  Copyright (C) 2014-2016  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014-2016  Kishore Narendran <kishore.narendran09@gmail.com>
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
const cookie = require('cookie');
const moment = require('moment');
const path = require('path');
const unirest = require('unirest');
const underscore = require('underscore');

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
    const cacheDoc = cache.get(data.reg_no);
    if (cacheDoc.dob === data.dob && cacheDoc.mobile === data.mobile) {
      const collection = app.db.collection('student');
      const keys = {
        reg_no: 1,
        dob: 1,
        mobile: 1,
        campus: 1,
        grades: 1,
        grade_count: 1,
        credits_registered: 1,
        credits_earned: 1,
        cgpa: 1,
        semester_wise: 1,
        grades_refreshed: 1
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

      if (cache.get(data.reg_no).grades_refreshed) {
        collection.findOne({reg_no: data.reg_no, dob: data.dob, campus: data.campus}, keys, onFetch);
      }
      else {
        let gradesUri;
        if (data.campus === 'vellore') {
          gradesUri = 'https://academics.vit.ac.in/parent/student_history.asp';
        }
        else if (data.campus === 'chennai') {
          gradesUri = 'http://academicscc.vit.ac.in/parent/student_history.asp';
        }

        const CookieJar = unirest.jar();
        const cookieSerial = cache.get(data.reg_no).cookie;

        const onRequest = function (response) {
          if (response.error) {
            data.status = status.vitDown;
            if (config.logentriesEnabled) {
              logentries.log('crit', data);
            }
            console.log(JSON.stringify(data));
            collection.findOne({reg_no: data.reg_no, dob: data.dob, campus: data.campus}, keys, onFetch);
          }
          else {
            const gradeValue = function (grade) {
              switch (grade) {
                case 'S':
                  return 10.0;
                  break;

                case 'A':
                  return 9.0;
                  break;

                case 'B':
                  return 8.0;
                  break;

                case 'C':
                  return 7.0;
                  break;

                case 'D':
                  return 6.0;
                  break;

                case 'E':
                  return 5.0;
                  break;

                case 'F':
                  return 0.0;
                  break;

                case 'P':
                  return true;
                  break;

                default:
                  return null;
                  break;
              }
            };
            const gradeCharacter = function (summaryNo) {
              switch (summaryNo) {
                case 0:
                  return 'S';
                  break;

                case 1:
                  return 'A';
                  break;

                case 2:
                  return 'B';
                  break;

                case 3:
                  return 'C';
                  break;

                case 4:
                  return 'D';
                  break;

                case 5:
                  return 'E';
                  break;

                case 6:
                  return 'F';
                  break;

                case 7:
                  return 'N';
                  break;

                default:
                  return null;
                  break;
              }
            };
            data.grades = [];
            data.semester_wise = {};
            data.grade_count = [];
            try {
              // Scraping Grades
              const baseScraper = cheerio.load(response.body);
              const gradesScraper = cheerio.load(baseScraper('table table').eq(1).html());
              const onEach = function (i, elem) {
                if (i > 0) {
                  const attrs = baseScraper(this).children('td');
                  const exam_held = moment(attrs.eq(6).text(), 'MMM-YYYY').format('YYYY-MM');
                  const grade = attrs.eq(5).text();
                  const credits = parseInt(attrs.eq(4).text());
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

                  // Computing Semester-Wise GPA
                  if (gradeValue(grade) === true) {
                    if (data.semester_wise[exam_held]) {
                      data.semester_wise[exam_held].credits = data.semester_wise[exam_held].credits + credits;
                    }
                    else {
                      data.semester_wise[exam_held] = {
                        exam_held: exam_held,
                        credits: credits,
                        gpa: 0.0
                      };
                    }
                  }
                  else if (gradeValue(grade)) {
                    if (data.semester_wise[exam_held]) {
                      data.semester_wise[exam_held].gpa = Math.round((data.semester_wise[exam_held].gpa * data.semester_wise[exam_held].credits + gradeValue(grade) * credits) / (data.semester_wise[exam_held].credits + credits) * 1e2) / 1e2;
                      data.semester_wise[exam_held].credits = data.semester_wise[exam_held].credits + credits;
                    }
                    else {
                      data.semester_wise[exam_held] = {
                        exam_held: exam_held,
                        credits: credits,
                        gpa: gradeValue(grade)
                      };
                    }
                  }
                }
              };
              gradesScraper('tr').each(onEach);

              // Convert semester-wise object to array
              data.semester_wise = underscore.values(data.semester_wise);

              // Scraping the credit summary
              const creditsTable = baseScraper('table table').eq(2).children('tr').eq(1);
              data.credits_registered = parseInt(creditsTable.children('td').eq(0).text());
              data.credits_earned = parseInt(creditsTable.children('td').eq(1).text());
              data.cgpa = parseFloat(creditsTable.children('td').eq(2).text().trim());

              // Scraping the grade summary information
              const gradeSummaryTable = baseScraper('table table').eq(3).children('tr').eq(1);

              const forEachGradeCount = function (i, elem) {
                data.grade_count.push({
                  count: parseInt(gradeSummaryTable.children('td').eq(i).text()),
                  value: gradeValue(gradeCharacter(i)),
                  grade: gradeCharacter(i)
                });
              };
              gradeSummaryTable.children('td').each(forEachGradeCount);
            }
            catch (ex) {
              data.credits_registered = 0;
              data.credits_earned = 0;
              data.semester_wise = [];
              data.grade_count = [];
              data.cgpa = 0.0;
            }
            finally {
              data.grades_refreshed = new Date().toJSON();
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
                  const validity = 3; // In Minutes
                  const doc = {
                    reg_no: data.reg_no,
                    dob: data.dob,
                    mobile: data.mobile,
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
                  grade_count: data.grade_count,
                  credits_registered: data.credits_registered,
                  credits_earned: data.credits_earned,
                  cgpa: data.cgpa,
                  semester_wise: data.semester_wise,
                  grades_refreshed: data.grades_refreshed
                }
              }, {safe: true, new: true, upsert: true}, onUpdate);
            }
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
      data.status = status.invalid;
      callback(true, data);
    }
  }
  else {
    data.status = status.timedOut;
    callback(null, data);
  }
};
