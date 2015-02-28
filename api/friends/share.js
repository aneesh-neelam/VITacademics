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
            console.log(JSON.stringify(data));
            callback(true, {status: status.codes.mongoDown});
        }
        else if (doc) {
            if (doc.courses) {
                var forEachCourse = function (elt, i, arr) {
                    delete elt['attendance'];
                    delete elt['marks'];
                    delete elt['registration_status'];
                    delete elt['bill_date'];
                    delete elt['bill_number'];
                };
                delete doc['_id'];
                doc.courses.forEach(forEachCourse);
                doc.status = status.codes.success;
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
            collection.findOne({reg_no: cache.get(data.token), campus: data.campus}, keys, onFetch);
        }
        else {
            data.status = status.codes.tokenExpired;
            callback(false, data);
        }
    }
    else {
        collection.findOne({reg_no: data.reg_no, dob: data.dob, campus: data.campus}, keys, onFetch);
    }
};
