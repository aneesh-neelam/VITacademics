/*
 *  VITacademics
 *  Copyright (C) 2014  Aneesh Neelam <neelam.aneesh@gmail.com>
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

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var attendance = require(path.join(__dirname, 'attendance'));
var errors = require(path.join(__dirname, '..', '..', 'error'));
var marks = require(path.join(__dirname, 'marks'));
var mongo = require(path.join(__dirname, '..', 'db', 'mongo'));
var timetable = require(path.join(__dirname, 'timetable'));
var friends = require(path.join(__dirname, '..', 'friends', 'generate'));


exports.getData = function (RegNo, DoB, firsttime, callback) {
    var data = {RegNo: RegNo};
    if (cache.get(RegNo) !== null) {
        if (cache.get(RegNo).DoB === DoB) {
            if (cache.get(RegNo).Refresh && !(firsttime)) {
                var keys = {
                    RegNo: 1,
                    Courses: 1,
                    Refreshed: 1
                };
                var onFetch = function (err, mongoDoc) {
                    if (err) {
                        if (log) {
                            log.log('debug', {
                                RegNo: RegNo,
                                Error: errors.codes.MongoDown
                            });
                        }
                        console.log('MongoDB is down');
                        callback(true, {Error: errors.codes.MongoDown});
                    }
                    else {
                        delete mongoDoc['_id'];
                        mongoDoc.Error = errors.codes.Success;
                        mongoDoc.Cached = true;
                        callback(false, mongoDoc);
                    }
                };
                mongo.fetch({RegNo: RegNo, DoB: DoB}, keys, onFetch);
            }
            else {
                var sem = process.env.CHENNAI_CURRENT_SEMESTER || 'FS14';

                var parallelTasks = {};

                parallelTasks.Attendance = function (asyncCallback) {
                    attendance.scrapeAttendance(RegNo, sem, asyncCallback)
                };

                parallelTasks.Marks = function (asyncCallback) {
                    marks.scrapeMarks(RegNo, sem, asyncCallback)
                };
                parallelTasks.Timetable = function (asyncCallback) {
                    timetable.scrapeTimetable(RegNo, sem, firsttime, asyncCallback)
                };

                if (firsttime) {
                    parallelTasks.Token = function (asyncCallback) {
                        friends.getToken(RegNo, DoB, asyncCallback)
                    };
                }

                var myCookie = cache.get(RegNo).Cookie;

                var onFinish = function (err, results) {
                    if (err || results.Timetable.Error.Code !== 0) {
                        data.Error = results.Timetable.Error;
                        if (log) {
                            log.log('debug', data);
                        }
                        console.log(data.Error);
                        callback(true, data);
                    }
                    else {
                        delete results.Timetable.Error;
                        data.Courses = results.Timetable.Courses;
                        var forEachCourse = function (element, asyncCallback) {
                            var foundAttendance = false;
                            var foundMarks = false;
                            var forEachAttendance = function (elt, i, arr) {
                                if (element['Class Number'] === elt['Class Number']) {
                                    foundAttendance = true;
                                    elt.Supported = 'yes';
                                    delete elt['Class Number'];
                                    delete elt['Course Code'];
                                    delete elt['Course Title'];
                                    delete elt['Course Type'];
                                    delete elt['Slot'];
                                    element.Attendance = elt;
                                }
                            };
                            var forEachMarks = function (elt, i, arr) {
                                if (element['Class Number'] === elt['Class Number']) {
                                    foundMarks = true;
                                    elt.Supported = 'yes';
                                    delete elt['Class Number'];
                                    delete elt['Course Code'];
                                    delete elt['Course Title'];
                                    delete elt['Course Type'];
                                    element.Marks = elt;
                                }
                            };
                            results.Attendance.forEach(forEachAttendance);
                            results.Marks.forEach(forEachMarks);
                            var noData = {
                                Supported: false
                            };
                            if (!foundAttendance) {
                                element.Attendance = noData;
                            }
                            if (!foundMarks) {
                                element.Marks = noData;
                            }
                            asyncCallback(null, element);
                        };
                        var doneCollate = function (err, newData) {
                            if (err) {
                                callback(true, errors.codes.Other);
                            }
                            else {
                                data.Courses = newData;
                                data.Refreshed = new Date().toUTCString();
                                var onInsert = function (err) {
                                    if (err) {
                                        data.Error = errors.codes.MongoDown;
                                        if (log) {
                                            log.log('debug', data);
                                        }
                                        console.log('MongoDB connection failed');
                                    }
                                    else {
                                        var validity = 3; // In Minutes
                                        var doc = {RegNo: RegNo, DoB: DoB, Cookie: myCookie, Refresh: !firsttime};
                                        cache.put(RegNo, doc, validity * 60 * 1000);
                                    }
                                };
                                if (firsttime) {
                                    data.Timetable = results.Timetable.Timetable;
                                    data.Share = results.Token.Share;
                                    data.Withdrawn = results.Timetable.Withdrawn;
                                    mongo.update(data, ['Timetable', 'Courses', 'Refreshed', 'Withdrawn'], onInsert);
                                }
                                else if (results.Timetable.Withdrawn) {
                                    data.Timetable = results.Timetable.Timetable;
                                    data.Withdrawn = results.Timetable.Withdrawn;
                                    mongo.update(data, ['Timetable', 'Courses', 'Refreshed', 'Withdrawn'], onInsert);
                                    delete data.Timetable;
                                }
                                else {
                                    data.Withdrawn = results.Timetable.Withdrawn;
                                    mongo.update(data, ['Courses', 'Refreshed', 'Withdrawn'], onInsert);
                                }
                                data.Cached = false;
                                data.Error = errors.codes.Success;
                                callback(null, data);
                            }
                        };
                        async.map(data.Courses, forEachCourse, doneCollate);
                    }
                };

                async.parallel(parallelTasks, onFinish);
            }
        }
        else {
            data.Error = errors.codes.Invalid;
            callback(true, data);
        }
    }
    else {
        data.Error = errors.codes.TimedOut;
        callback(true, data);
    }
};
