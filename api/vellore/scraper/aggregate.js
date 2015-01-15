/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
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

var async = require('async');
var cache = require('memory-cache');
var path = require('path');
var underscore = require('underscore');

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var attendance = require(path.join(__dirname, 'attendance'));
var status = require(path.join(__dirname, '..', '..', 'status'));
var marks = require(path.join(__dirname, 'marks'));
var mongo = require(path.join(__dirname, '..', 'db', 'mongo'));
var timetable = require(path.join(__dirname, 'timetable'));
var friends = require(path.join(__dirname, '..', 'friends', 'generate'));


exports.getData = function (RegNo, DoB, firsttime, callback) {
    var data = {reg_no: RegNo};
    if (cache.get(RegNo) !== null) {
        if (cache.get(RegNo).dob === DoB) {
            if (cache.get(RegNo).refreshed && !(firsttime)) {
                var keys = {
                    reg_no: 1,
                    courses: 1,
                    refreshed: 1
                };
                var onFetch = function (err, mongoDoc) {
                    if (err) {
                        if (log) {
                            log.log('debug', {
                                reg_no: RegNo,
                                status: status.codes.mongoDown
                            });
                        }
                        console.log('MongoDB is down');
                        callback(true, {status: status.codes.mongoDown});
                    }
                    else if (mongoDoc) {
                        delete mongoDoc['_id'];
                        mongoDoc.status = status.codes.success;
                        mongoDoc.cached = true;
                        callback(false, mongoDoc);
                    }
                    else {
                        callback(true, {status: status.codes.noData});
                    }
                };
                mongo.fetch({reg_no: RegNo, dob: DoB}, keys, onFetch);
            }
            else {
                var sem = process.env.VELLORE_CURRENT_SEMESTER || 'WS';

                var parallelTasks = {};

                parallelTasks.attendance = function (asyncCallback) {
                    attendance.scrapeAttendance(RegNo, sem, asyncCallback)
                };

                parallelTasks.marks = function (asyncCallback) {
                    marks.scrapeMarks(RegNo, sem, asyncCallback)
                };
                parallelTasks.timetable = function (asyncCallback) {
                    timetable.scrapeTimetable(RegNo, sem, firsttime, asyncCallback)
                };

                if (firsttime) {
                    parallelTasks.token = function (asyncCallback) {
                        friends.getToken(RegNo, DoB, asyncCallback)
                    };
                }

                var myCookie = cache.get(RegNo).cookie;

                var onFinish = function (err, results) {
                    if (err || results.timetable.status.code !== 0) {
                        data.status = results.timetable.status;
                        if (log) {
                            log.log('debug', data);
                        }
                        console.log(data.status);
                        callback(true, data);
                    }
                    else {
                        delete results.timetable.status;
                        data.courses = results.timetable.courses;
                        var forEachCourse = function (element, asyncCallback) {
                            var foundAttendance = false;
                            var foundMarks = false;
                            var forEachAttendance = function (elt, i, arr) {
                                if (element['class_number'] === elt['class_number']) {
                                    foundAttendance = true;
                                    elt.supported = true;
                                    delete elt['class_number'];
                                    delete elt['course_code'];
                                    delete elt['course_title'];
                                    delete elt['course_type'];
                                    delete elt['slot'];
                                    element.attendance = elt;
                                }
                            };
                            var forEachMarks = function (elt, i, arr) {
                                if (element['class_number'] === elt['class_number']) {
                                    foundMarks = true;
                                    elt.supported = true;
                                    delete elt['class_number'];
                                    delete elt['course_code'];
                                    delete elt['course_title'];
                                    delete elt['course_type'];
                                    if (elt.details) {
                                        element['pbl_marks'] = underscore.values(elt.details);
                                    }
                                    else {
                                        element[element.course_mode.toLowerCase() + '_marks'] = elt;
                                    }
                                }
                            };
                            results.attendance.forEach(forEachAttendance);
                            results.marks.forEach(forEachMarks);
                            var noData = {
                                supported: false
                            };
                            if (!foundAttendance) {
                                element.attendance = noData;
                            }
                            if (!foundMarks) {
                                if (element.course_mode === 'PBL' || element.course_mode === 'RBL') {
                                    element['pbl_marks'] = noData;
                                }
                                else {
                                    element[element.course_mode.toLowerCase() + '_marks'] = noData;
                                }
                            }
                            asyncCallback(null, element);
                        };
                        var doneCollate = function (err, newData) {
                            if (err) {
                                callback(true, status.codes.other);
                            }
                            else {
                                data.courses = newData;
                                data.refreshed = new Date().toJSON();
                                var onInsert = function (err) {
                                    if (err) {
                                        data.status = status.codes.mongoDown;
                                        if (log) {
                                            log.log('debug', data);
                                        }
                                        console.log('MongoDB connection failed');
                                    }
                                    else {
                                        var validity = 3; // In Minutes
                                        var doc = {reg_no: RegNo, dob: DoB, cookie: myCookie, refreshed: !firsttime};
                                        cache.put(RegNo, doc, validity * 60 * 1000);
                                    }
                                };
                                if (firsttime) {
                                    data.timetable = results.timetable.timetable;
                                    data.share = results.token.share;
                                    data.withdrawn = results.timetable.withdrawn;
                                    mongo.update(data, ['timetable', 'courses', 'refreshed', 'withdrawn'], onInsert);
                                }
                                else if (results.timetable.withdrawn) {
                                    data.timetable = results.timetable.timetable;
                                    data.withdrawn = results.timetable.withdrawn;
                                    mongo.update(data, ['timetable', 'courses', 'refreshed', 'withdrawn'], onInsert);
                                    delete data.timetable;
                                }
                                else {
                                    data.withdrawn = results.timetable.withdrawn;
                                    mongo.update(data, ['courses', 'refreshed', 'withdrawn'], onInsert);
                                }
                                data.cached = false;
                                data.status = status.codes.success;
                                callback(null, data);
                            }
                        };
                        async.map(data.courses, forEachCourse, doneCollate);
                    }
                };

                async.parallel(parallelTasks, onFinish);
            }
        }
        else {
            data.status = status.codes.invalid;
            callback(true, data);
        }
    }
    else {
        data.status = status.codes.timedOut;
        callback(true, data);
    }
};
