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

const async = require('async');
const cache = require('memory-cache');
const path = require('path');
const underscore = require('underscore');

const config = require(path.join(__dirname, '..', '..', 'config'));

let logentries;
if (config.logentriesEnabled) {
  const LogentriesClient = require('logentries-client');
  logentries = new LogentriesClient({
    token: config.logentriesToken
  });
}

const attendance = require(path.join(__dirname, 'attendance'));
const friends = require(path.join(__dirname, '..', 'friends', 'generate'));
const marks = require(path.join(__dirname, 'marks'));
const status = require(path.join(__dirname, '..', '..', 'status'));
const timetable = require(path.join(__dirname, 'timetable'));


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
        semester: 1,
        courses: 1,
        withdrawn_courses: 1,
        refreshed: 1
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
      if (cache.get(data.reg_no).refreshed) {
        collection.findOne({reg_no: data.reg_no, dob: data.dob, campus: data.campus}, keys, onFetch);
      }
      else {
        if (data.campus === 'vellore') {
          data.semester = config.velloreSemesterCode;
        }
        else if (data.campus === 'chennai') {
          data.semester = config.chennaiSemesterCode;
        }
        const cookieSerial = cache.get(data.reg_no).cookie;
        const parallelTasks = {
          attendance: function (asyncCallback) {
            attendance.scrapeAttendance(app, data, asyncCallback)
          },
          marks: function (asyncCallback) {
            marks.scrapeMarks(app, data, asyncCallback)
          },
          timetable: function (asyncCallback) {
            timetable.scrapeTimetable(app, data, asyncCallback)
          }
        };
        const onFinish = function (err, results) {
            if (err || results.timetable.status.code !== 0) {
              data.status = results.timetable.status;
              if (config.logentriesEnabled) {
                logentries.log('err', data);
              }
              data.HTML_error = true;
              console.log(JSON.stringify(data));
              collection.findOne({reg_no: data.reg_no, dob: data.dob, campus: data.campus}, keys, onFetch);
            }
            else {
              delete results.timetable.status;
              data.courses = results.timetable.courses;
              const forEachCourse = function (element, asyncCallback) {
                let foundAttendance = false;
                let foundMarks = false;
                element.timings = [];
                switch (element.course_mode.toUpperCase()) {
                  case 'CBL':
                    element.course_type = 1;
                    break;
                  case 'LBC':
                    element.course_type = 2;
                    break;
                  case 'PBL':
                    element.course_type = 3;
                    break;
                  case 'RBL':
                    element.course_type = 4;
                    break;
                  case 'PBC':
                    if (element.project_title) {
                      element.course_type = 5;
                    }
                    else {
                      element.course_type = 6;
                    }
                    break;
                  default:
                    element.course_type = 0;
                    break;
                }
                const forEachAttendance = function (elt, i, arr) {
                  if (element.class_number === elt.class_number) {
                    foundAttendance = true;
                    elt.supported = true;
                    delete elt.class_number;
                    delete elt.course_code;
                    delete elt.course_title;
                    delete elt.course_type;
                    delete elt.slot;
                    element.attendance = elt;
                  }
                };
                const forEachMarks = function (elt, i, arr) {
                  if (element.class_number === elt.class_number) {
                    foundMarks = true;
                    elt.supported = true;
                    delete elt.class_number;
                    delete elt.course_code;
                    delete elt.course_title;
                    delete elt.course_type;

                    if (elt.pbl_details) {
                      const forEachPblDetail = function (detail, index, list) {
                        if (detail.title !== 'N/A') {
                          elt.assessments.push(detail)
                        }
                      };
                      underscore.values(elt.pbl_details).forEach(forEachPblDetail);
                      delete elt.pbl_details;
                    }

                    elt.max_marks = 0;
                    elt.max_percentage = 0;
                    elt.scored_marks = 0;
                    elt.scored_percentage = 0;
                    const forEachAssessment = function (assessment, index, list) {
                      elt.max_marks = elt.max_marks + (assessment.max_marks || 0);
                      elt.max_percentage = elt.max_percentage + (assessment.weightage || 0);
                      elt.scored_marks = elt.scored_marks + (assessment.scored_marks || 0);
                      elt.scored_percentage = elt.scored_percentage + (assessment.scored_percentage || 0);
                    };
                    underscore.values(elt.assessments).forEach(forEachAssessment);
                    element.marks = elt;
                  }
                };
                const forEachTimings = function (elt, i, arr) {
                  if (element.class_number === elt.class_number) {
                    delete elt.class_number;
                    element.timings.push(elt);
                  }
                };
                results.attendance.forEach(forEachAttendance);
                results.marks.forEach(forEachMarks);
                results.timetable.timings.forEach(forEachTimings);
                const noData = {
                  supported: false
                };
                if (!foundAttendance) {
                  element.attendance = noData;
                }
                if (!foundMarks) {
                  element.marks = noData;
                }
                element.credits = parseInt(element.ltpjc.slice(4));
                const class_count = element.timings.length || 1;
                const total_classes = parseInt(element.ltpjc.charAt(0)) + parseInt(element.ltpjc.charAt(1)) + parseInt(element.ltpjc.charAt(2));
                element.class_length = total_classes / class_count;
                asyncCallback(null, element);
              };
              const doneCollate = function (err, newData) {
                if (err) {
                  callback(true, status.other);
                }
                else {
                  data.courses = newData;
                  data.refreshed = new Date().toJSON();
                  data.withdrawn_courses = results.timetable.withdrawn_courses;
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
                      const validity = 3; // In Minutes
                      const doc = {
                        reg_no: data.reg_no,
                        dob: data.dob,
                        mobile: data.mobile,
                        cookie: cookieSerial,
                        refreshed: true
                      };
                      cache.put(data.reg_no, doc, validity * 60 * 1000);
                      data.cached = false;
                      data.status = status.success;
                      callback(null, data);
                    }
                  };
                  collection.findAndModify({reg_no: data.reg_no}, [
                    ['reg_no', 'asc']
                  ], {
                    $set: {
                      courses: data.courses,
                      semester: data.semester,
                      refreshed: data.refreshed,
                      withdrawn_courses: data.withdrawn_courses
                    }
                  }, {safe: true, new: true, upsert: true}, onUpdate);
                }
              };
              async.map(data.courses, forEachCourse, doneCollate);
            }
          }
          ;
        async.parallel(parallelTasks, onFinish);
      }
    }
    else {
      data.status = status.invalid;
      callback(true, data);
    }
  }
  else {
    data.status = status.timedOut;
    callback(true, data);
  }
};
