var mongo = require('./mongo');
var errors = require('./error');
var cache = require('memory-cache');
var async = require('async');

exports.getData = function (RegNo, firsttime, callback)
{
    if (cache.get(RegNo) !== null)
    {
        var data;
        var scrapeAttendance = function (callback)
        {
            // TODO
            var attendance = {"Attendance": "Done"};
            callback(null, attendance);
        };
        var scrapeMarks = function (callback)
        {
            // TODO
            var marks = {"Marks": "Done"};
            callback(null, marks);
        };
        var scrapeTimetable = function (callback)
        {
            // TODO
            var timetable = {"Timetable": "Done"};
            callback(null, timetable);
        };
        var parallelTasks;
        if (firsttime)
        {
            parallelTasks = {
                "Attendance": scrapeAttendance,
                "Marks": scrapeMarks,
                "Timetable": scrapeTimetable
            };
        }
        else
        {
            parallelTasks = {
                "Attendance": scrapeAttendance,
                "Marks": scrapeMarks
            };
        }
        var onFinish = function (err, results)
        {
            // TODO
            data = {"Error": errors.codes["Success"], "Data": results};
            callback(data);
        };
        async.parallel(parallelTasks, onFinish);
    }
    else callback({"Error": errors.codes['TimedOut']});
};