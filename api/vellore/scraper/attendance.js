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

var errors = require('../error');
var async = require('async');
var cache = require('memory-cache');
var cheerio = require('cheerio');
var cookie = require('cookie');
var unirest = require('unirest');

exports.scrapeAttendance = function (RegNo, sem, callback)
{
    var attendanceUri = 'https://academics.vit.ac.in/parent/attn_report.asp?sem=' + sem;
    var CookieJar = unirest.jar();
    var myCookie = cache.get(RegNo);
    var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
    var onRequest = function (response)
    {
        if (response.error) callback(true, errors.codes.Down);
        else
        {
            var attendance = [];
            try
            {
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
                        var regdate = ($('td').eq(5).text());
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
                var doDetails = function (doc, asyncCallback)
                {
                    var detailsUri = 'https://academics.vit.ac.in/parent/attn_report_details.asp';
                    CookieJar.add(unirest.cookie(cookieSerial), detailsUri);
                    var onPost = function (response)
                    {
                        if (response.error) asyncCallback(true, errors.codes.Down);
                        else
                        {
                            delete doc.form;
                            try
                            {
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
                                asyncCallback(null, doc);
                            }
                            catch (ex)
                            {
                                // Scraping Attendance Details failed
                                asyncCallback(true, {Error: errors.codes.Invalid});
                            }
                        }
                    };
                    unirest.post(detailsUri)
                        .jar(CookieJar)
                        .form(doc.form)
                        .end(onPost);
                };
                async.map(attendance, doDetails, callback);
            }
            catch (ex)
            {
                // Scraping Attendance failed
                callback(true, {Error: errors.codes.Invalid});
            }
        }
    };
    CookieJar.add(unirest.cookie(cookieSerial), attendanceUri);
    unirest.post(attendanceUri)
        .jar(CookieJar)
        .end(onRequest);
};