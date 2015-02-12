/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2015  Ayush Agarwal <agarwalayush161@gmail.com>
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

var status = require(path.join(__dirname, '..', 'status'));


exports.scrapeAttendance = function (app, data, callback) {
    var attendanceUri;
    var attendanceDetailsUri;
    if (data.campus === 'vellore') {
        attendanceUri = 'https://academics.vit.ac.in/parent/attn_report.asp?sem=' + data.semester;
        attendanceDetailsUri = 'https://academics.vit.ac.in/parent/attn_report_details.asp';
    }
    else if (data.campus === 'chennai') {
        attendanceUri = 'http://27.251.102.132/parent/attn_report.asp?sem=' + data.semester;
        attendanceDetailsUri = 'http://27.251.102.132/parent/attn_report_details.asp';
    }
    var CookieJar = unirest.jar();
    var myCookie = cache.get(data.reg_no).cookie;
    var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
    var onRequest = function (response) {
        if (response.error) {
            callback(false, [
                status.codes.vitDown
            ]);
        }
        else {
            var attendance = [];
            try {
                var scraper = cheerio.load(response.body);
                scraper = cheerio.load(scraper('table table').eq(1).html());
                var onEach = function (i, elem) {
                    var htmlRow = cheerio.load(scraper(this).html());
                    var htmlColumn = htmlRow('td');
                    if (i > 0) {
                        var classnbr = htmlRow('input[name=classnbr]').attr('value');
                        attendance.push({
                            class_number: classnbr,
                            course_code: htmlColumn.eq(1).text(),
                            course_title: htmlColumn.eq(2).text(),
                            course_type: htmlColumn.eq(3).text(),
                            slot: htmlColumn.eq(4).text(),
                            registration_date: htmlColumn.eq(5).text(),
                            attended_classes: htmlColumn.eq(6).text(),
                            total_classes: htmlColumn.eq(7).text(),
                            attendance_percentage: htmlColumn.eq(8).text(),
                            form: {
                                semcode: htmlRow('input[name=semcode]').attr('value'),
                                from_date: htmlRow('input[name=from_date]').attr('value'),
                                to_date: htmlRow('input[name=to_date]').attr('value'),
                                classnbr: classnbr
                            }
                        });
                    }
                };
                scraper('tr').each(onEach);
                var doDetails = function (doc, asyncCallback) {
                    var onPost = function (response) {
                        if (response.error) {
                            asyncCallback(false, [
                                status.codes.vitDown
                            ]);
                        }
                        else {
                            delete doc.form;
                            try {
                                var scraper = cheerio.load(response.body);
                                scraper = cheerio.load(scraper('table table').eq(1).html());
                                var details = [];
                                var onDay = function (i, elem) {
                                    var htmlColumn = cheerio.load(scraper(this).html())('td');
                                    if (i > 1) {
                                        details.push({
                                            sl: htmlColumn.eq(0).text(),
                                            date: new Date(Date.parse(htmlColumn.eq(1).text())).toDateString(),
                                            status: htmlColumn.eq(3).text(),
                                            reason: htmlColumn.eq(5).text()
                                        });
                                    }
                                };
                                scraper('tr').each(onDay);
                                doc.details = details;
                                asyncCallback(null, doc);
                            }
                            catch (ex) {
                                doc.details = [];
                                asyncCallback(false, doc);
                            }
                        }
                    };
                    unirest.post(attendanceDetailsUri)
                        .jar(CookieJar)
                        .form(doc.form)
                        .end(onPost);
                };
                async.map(attendance, doDetails, callback);
            }
            catch (ex) {
                callback(false, [
                    status.codes.invalid
                ]);
            }
        }
    };
    CookieJar.add(unirest.cookie(cookieSerial), attendanceUri);
    CookieJar.add(unirest.cookie(cookieSerial), attendanceDetailsUri);
    unirest.post(attendanceUri)
        .jar(CookieJar)
        .end(onRequest);
};
