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

var cache = require('memory-cache');
var path = require('path');

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}


var status = require(path.join(__dirname, '..', '..', 'status'));
var mongo = require(path.join(__dirname, '..', 'db', 'mongo'));


exports.getTimetableToken = function (token, callback) {
    if (cache.get(token) !== null) {
        var keys = {
            reg_no: 1,
            timetable: 1,
            courses: 1
        };
        var onFetch = function (err, doc) {
            if (err) {
                if (log) {
                    log.log('debug', {
                        token: token,
                        status: status.codes.mongoDown
                    });
                }
                console.log('MongoDB is down');
                callback(true, {status: status.codes.mongoDown});
            }
            else if (doc) {
                if (doc.timetable && doc.courses && doc.reg_no) {
                    var forEachCourse = function (elt, i, arr) {
                        delete elt['attendance'];
                        delete elt['marks'];
                        delete elt['cbl_marks'];
                        delete elt['lbc_marks'];
                        delete elt['pbc_marks'];
                        delete elt['pbl_marks'];
                    };
                    doc.courses.forEach(forEachCourse);
                    var data = {
                        data: {
                            reg_no: doc.reg_no,
                            courses: doc.courses,
                            timetable: doc.timetable
                        },
                        status: status.codes.success
                    };
                    callback(false, data);
                }
                else {
                    callback(false, {status: status.codes.noData})
                }
            }
            else {
                callback(false, {status: status.codes.noData})
            }
        };
        mongo.fetch({reg_no: cache.get(token)}, keys, onFetch);
    }
    else {
        callback(false, {status: status.codes.tokenExpired});
    }
};

exports.getTimetableDoB = function (RegNo, DoB, callback) {
    var keys = {
        reg_no: 1,
        timetable: 1,
        courses: 1
    };
    var onFetch = function (err, doc) {
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
        else if (doc) {
            if (doc.timetable && doc.courses && doc.reg_no) {
                var forEachCourse = function (elt, i, arr) {
                    delete elt['attendance'];
                    delete elt['marks'];
                    delete elt['cbl_marks'];
                    delete elt['lbc_marks'];
                    delete elt['pbc_marks'];
                    delete elt['pbl_marks'];
                };
                doc.courses.forEach(forEachCourse);
                var data = {
                    data: {
                        reg_no: doc.reg_no,
                        courses: doc.courses,
                        timetable: doc.timetable
                    },
                    status: status.codes.success
                };
                callback(false, data)
            }
            else {
                callback(false, {status: status.codes.noData});
            }
        }
        else {
            callback(false, {status: status.codes.noData});
        }
    };
    mongo.fetch({reg_no: RegNo, dob: DoB}, keys, onFetch);
};
