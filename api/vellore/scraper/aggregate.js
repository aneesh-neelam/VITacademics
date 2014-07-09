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

var attendance = require('./attendance');
var errors = require('./../error');
var marks = require('./marks');
var mongo = require('./../db/mongo');
var timetable = require('./timetable');
var async = require('async');
var cache = require('memory-cache');
var debug = require('debug')('VITacademics');

exports.getData = function (RegNo, firsttime, callback)
{
    var data = {RegNo: RegNo};
    if (cache.get(RegNo) !== null)
    {
        var sem = 'WS';

        var attendanceTask = function (asyncCallback)
        {
            attendance.scrapeAttendance(RegNo, sem, asyncCallback)
        };
        var marksTask = function (asyncCallback)
        {
            marks.scrapeMarks(RegNo, sem, asyncCallback)
        };
        var timetableTask = function (asyncCallback)
        {
            timetable.scrapeTimetable(RegNo, sem, firsttime, asyncCallback)
        };

        var parallelTasks = {
            Attendance: attendanceTask,
            Marks: marksTask,
            Timetable: timetableTask
        };

        var onFinish = function (err, results)
        {
            if (err)
            {
                data.Error = results.Attendance.Error || results.Marks.Error || results.Timetable.Error;
                data.Data = results;
                callback(null, data);
            }
            else
            {
                // TODO Aggregation
                data.Data = results;
                var onInsert = function (err)
                {
                    if (err)
                    {
                        debug('MongoDB connection failed');
                        // callback(true, errors.codes.MongoDown);
                        // Asynchronous, may or may not be reachable, need a better solution
                    }
                };
                mongo.update(data, 'Data', onInsert);
                data.Error = errors.codes.Success;
                callback(null, data);
            }
        };

        async.parallel(parallelTasks, onFinish);
    }
    else
    {
        data.Error = errors.codes.TimedOut;
        data.Data = null;
        callback(null, data);
    }
};