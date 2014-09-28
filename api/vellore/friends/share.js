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
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}


var errors = require(path.join(__dirname, '..', '..', 'error'));
var mongo = require(path.join(__dirname, '..', 'db', 'mongo'));

exports.getTimetable = function (token, callback)
{
    var data = {};
    if (cache.get(token) !== null)
    {
        var keys = {
            RegNo: 1,
            Timetable: 1,
            Courses: 1
        };
        var onFetch = function (err, doc)
        {
            if (err)
            {
                if (log)
                {
                    log.log('debug', {
                        Token: token,
                        Error: errors.codes.MongoDown
                    });
                }
                console.log('MongoDB is down');
                callback(true, {Error: errors.codes.MongoDown});
            }
            else if (doc)
            {
                if (doc.Timetable && doc.Courses && doc.RegNo)
                {
                    var forEachCourse = function (elt, i, arr)
                    {
                        delete elt['Attendance'];
                        delete elt['Marks'];
                    };
                    doc.Courses.forEach(forEachCourse);
                    var data = {
                        Data: {
                            RegNo: doc.RegNo,
                            Courses: doc.Courses,
                            Timetable: doc.Timetable
                        },
                        Error: errors.codes.Success
                    };
                    callback(true, data);
                }
                else
                {
                    callback(null, {Error: errors.codes.NoData})
                }
            }
            else
            {
                callback(null, {Error: errors.codes.NoData})
            }
        };
        mongo.fetch({RegNo: cache.get(token)}, keys, onFetch);
    }
    else
    {
        data.Error = errors.codes.Expired;
        callback(true, data);
    }
};

exports.getTimetable = function (RegNo, DoB, callback)
{
    var data = {};
    if (cache.get(token) !== null)
    {
        var keys = {
            RegNo: 1,
            Timetable: 1,
            Courses: 1
        };
        var onFetch = function (err, doc)
        {
            if (err)
            {
                if (log)
                {
                    log.log('debug', {
                        Token: token,
                        Error: errors.codes.MongoDown
                    });
                }
                console.log('MongoDB is down');
                callback(true, {Error: errors.codes.MongoDown});
            }
            else if (doc)
            {
                if (doc.Timetable && doc.Courses && doc.RegNo)
                {
                    var forEachCourse = function (elt, i, arr)
                    {
                        delete elt['Attendance'];
                        delete elt['Marks'];
                    };
                    doc.Courses.forEach(forEachCourse);
                    var data = {
                        Data: {
                            RegNo: doc.RegNo,
                            Courses: doc.Courses,
                            Timetable: doc.Timetable
                        },
                        Error: errors.codes.Success
                    };
                    callback(true, data);
                }
                else
                {
                    callback(null, {Error: errors.codes.NoData})
                }
            }
            else
            {
                callback(null, {Error: errors.codes.NoData})
            }
        };
        mongo.fetch({RegNo: cache.get(token)}, keys, onFetch);
    }
    else
    {
        data.Error = errors.codes.Expired;
        callback(true, data);
    }
};
