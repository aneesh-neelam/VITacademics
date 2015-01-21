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

var cache = require('memory-cache');
var path = require('path');

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}


var status = require(path.join(__dirname, '..', 'status'));


exports.get = function (app, data, callback) {
    var collection = app.db.collection('student');
    var keys = {
        reg_no: 1,
        timetable: 1,
        courses: 1,
        campus: 1,
        semester: 1
    };
    var onFetch = function (err, doc) {
        if (err) {
            data.status = status.codes.mongoDown;
            if (log) {
                log.log('debug', data);
            }
            console.log(data.status);
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
                delete doc['_id'];
                doc.courses.forEach(forEachCourse);
                doc.status = status.codes.success;

                /* Android App Compatibility Mode */
                doc.data = {
                    reg_no: doc.reg_no,
                    timetable: doc.timetable,
                    courses: doc.courses,
                    compatibility: {
                        message: 'For compatibility with Android App version 3.5.0, do not use "data" key, should be deprecated soon'
                    }
                };
                /* Android App Compatibility Mode */

                callback(false, doc);
            }
            else {
                data.status = status.codes.noData;
                callback(false, data);
            }
        }
        else {
            data.status = status.codes.noData;
            callback(false, data);
        }
    };
    if (data.token) {
        if (cache.get(data.token)) {
            collection.findOne({reg_no: cache.get(data.token)}, keys, onFetch);
        }
        else {
            data.status = status.codes.tokenExpired;
            callback(false, data);
        }
    }
    else {
        collection.findOne({reg_no: data.reg_no, dob: data.dob}, keys, onFetch);
    }
};
