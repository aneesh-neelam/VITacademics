var mongo = require('./mongo');
var errors = require('./error');
var unirest = require('unirest');
var cache = require('memory-cache');
var cookie = require('cookie');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');

exports.getData = function (RegNo, firsttime, callback)
{
    if (cache.get(RegNo) !== null)
    {
        var sem = 'WS';
        var data;
        var scrapeAttendance = function (callback)
        {
            var uri = 'https://academics.vit.ac.in/parent/attn_report.asp?sem=' + sem;
            var CookieJar = unirest.jar();
            var myCookie = cache.get(RegNo);
            var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
            var onRequest = function (response)
            {
                if (response.error)
                {
                    callback(true, errors.codes.Down);
                }
                else
                {
                    var attendance = [];
                    var scraper = cheerio.load(response.body);
                    scraper = cheerio.load(scraper('table table').eq(1).html());
                    var onEach = function (i, elem)
                    {
                        var $ = cheerio.load(scraper(this).html());
                        if (i > 0)
                        {
                            var code = $('td').eq(1).text();
                            var title = $('td').eq(2).text();
                            var type = $('td').eq(3).text();
                            var slot = $('td').eq(4).text();
                            var regdate = $('td').eq(5).text();
                            var attended = $('td').eq(6).text();
                            var total = $('td').eq(7).text();
                            var percentage = $('td').eq(8).text();
                            var classnbr = $('input[name=classnbr]').attr('value');
                            var semcode = $('input[name=semcode]').attr('value');
                            var from_date = $('input[name=from_date]').attr('value');
                            var to_date = $('input[name=to_date]').attr('value');
                            var doc = {
                                'Class Number': classnbr,
                                'Course Code': code,
                                'Course Title': title,
                                'Course Type': type,
                                'Slot': slot,
                                'Registration Date': regdate,
                                'Attended Classes': attended,
                                'Total Classes': total,
                                'Attendance Percentage': percentage,
                                'form': {
                                    'semcode': semcode,
                                    'from_date': from_date,
                                    'to_date': to_date,
                                    'classnbr': classnbr
                                }
                            };
                            attendance.push(doc);
                        }
                    };
                    scraper('tr').each(onEach);
                    var details = function (doc, functionCallback)
                    {
                        var detailsUri = 'https://academics.vit.ac.in/parent/attn_report_details.asp';
                        CookieJar.add(unirest.cookie(cookieSerial), detailsUri);
                        var onPost = function (response)
                        {
                            delete doc.form;
                            var scraper = cheerio.load(response.body);
                            scraper = cheerio.load(scraper('table table').eq(1).html());
                            var details = [];
                            var onDay = function (i, elem)
                            {
                                var $ = cheerio.load(scraper(this).html());
                                if (i > 1)
                                {
                                    var sl = $('td').eq(0).text();
                                    var date = $('td').eq(1).text();
                                    var status = $('td').eq(3).text();
                                    var reason = $('td').eq(5).text();
                                    var det = {
                                        'Serial': sl,
                                        'Date': date,
                                        'Attendance Status': status,
                                        'Reason': reason
                                    };
                                    details.push(det);
                                }
                            };
                            scraper('tr').each(onDay);
                            doc.Details = details;
                            functionCallback(null, doc);
                        };
                        unirest.post(detailsUri)
                            .jar(CookieJar)
                            .form(doc.form)
                            .end(onPost);
                    };
                    var onFinish = function (err, results)
                    {
                        if (err) callback(true, null);
                        callback(null, results);
                    };
                    async.map(attendance, details, onFinish);
                }
            };
            CookieJar.add(unirest.cookie(cookieSerial), uri);
            unirest.post(uri)
                .jar(CookieJar)
                .end(onRequest);
        };

        var scrapeMarks = function (callback)
        {
            var marksUri = 'https://academics.vit.ac.in/parent/marks.asp?sem=' + sem;
            // TODO Scrape Marks
            var marks = {Marks: 'TODO'};
            callback(null, marks);
        };

        var scrapeTimetable = function (callback)
        {
            var timetableUri = 'https://academics.vit.ac.in/parent/timetable.asp?sem=' + sem;
            // TODO Scrape Timetable
            var timetable = {Timetable: 'TODO'};
            callback(null, timetable);
        };

        var parallelTasks;
        if (firsttime)
        {
            parallelTasks = {
                Attendance: scrapeAttendance,
                Marks: scrapeMarks,
                Timetable: scrapeTimetable
            };
        }
        else
        {
            parallelTasks = {
                Attendance: scrapeAttendance,
                Marks: scrapeMarks
            };
        }

        var onFinish = function (err, results)
        {
            // TODO Aggregation and Mongo Insert
            if (err)
            {
                data = {Error: errors.codes.Down, Data: null};
                callback(null, data);
            }
            else
            {
                data = {Error: errors.codes.Success, Data: results};
                callback(null, data);
            }
        };

        async.parallel(parallelTasks, onFinish);
    }
    else callback(null, {Error: errors.codes.TimedOut});
};