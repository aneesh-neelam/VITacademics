/*
 *  VITacademics
 *  Copyright (C) 2014  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014  Ayush Agarwal <agarwalayush161@gmail.com>
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
var cheerio = require('cheerio');
var cookie = require('cookie');
var path = require('path');
var unirest = require('unirest');

var status = require(path.join(__dirname, '..', '..', 'status'));


exports.scrapeAttendance = function (RegNo, sem, callback) {
    var attendanceUri = 'http://27.251.102.132/parent/attn_report.asp?sem=' + sem;
    var CookieJar = unirest.jar();
    var myCookie = cache.get(RegNo).Cookie;
    var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
    var onRequest = function (response) {
        if (response.error) {
            callback(false, [
                {Error: errors.codes.Down}
            ]);
        }
        else {
            var attendance = [];
            try {
                var scraper = cheerio.load(response.body);
                scraper = cheerio.load(scraper('table table').eq(1).html());
                var onEach = function (i, elem) {
                    var $ = cheerio.load(scraper(this).html());
                    if (i > 0) {
                        var classnbr = $('input[name=classnbr]').attr('value');
                        attendance.push({
                                            'class_number': classnbr,
                                            'course_code': $('td').eq(1).text(),
                                            'course_title': $('td').eq(2).text(),
                                            'course_type': $('td').eq(3).text(),
                                            'slot': $('td').eq(4).text(),
                                            'registration_date': $('td').eq(5).text(),
                                            'attended_classes': $('td').eq(6).text(),
                                            'total_classes': $('td').eq(7).text(),
                                            'attendance_percentage': $('td').eq(8).text(),
                                            'form': {
                                                'semcode': $('input[name=semcode]').attr('value'),
                                                'from_date': $('input[name=from_date]').attr('value'),
                                                'to_date': $('input[name=to_date]').attr('value'),
                                                'classnbr': classnbr
                                            }
                                        });
                    }
                };
                scraper('tr').each(onEach);
                var doDetails = function (doc, asyncCallback) {
                    var detailsUri = 'http://27.251.102.132/parent/attn_report_details.asp';
                    CookieJar.add(unirest.cookie(cookieSerial), detailsUri);
                    var onPost = function (response) {
                        if (response.error) {
                            asyncCallback(false, [
                                {Error: errors.codes.Down}
                            ]);
                        }
                        else {
                            delete doc.form;
                            try {
                                var scraper = cheerio.load(response.body);
                                scraper = cheerio.load(scraper('table table').eq(1).html());
                                var details = [];
                                var onDay = function (i, elem) {
                                    var $ = cheerio.load(scraper(this).html());
                                    if (i > 1) {
                                        details.push({
                                                         'sl': $('td').eq(0).text(),
                                                         'date': $('td').eq(1).text(),
                                                         'status': $('td').eq(3).text(),
                                                         'reason': $('td').eq(5).text()
                                                     });
                                    }
                                };
                                scraper('tr').each(onDay);
                                doc.Details = details;
                                asyncCallback(null, doc);
                            }
                            catch (ex) {
                                doc.Details = [];
                                asyncCallback(false, doc);
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
            catch (ex) {
                // Scraping Attendance failed
                callback(false, [
                    {Error: errors.codes.Invalid}
                ]);
            }
        }
    };
    CookieJar.add(unirest.cookie(cookieSerial), attendanceUri);
    unirest.post(attendanceUri)
        .jar(CookieJar)
        .end(onRequest);
};
