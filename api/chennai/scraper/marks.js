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
var cheerio = require('cheerio');
var cookie = require('cookie');
var path = require('path');
var unirest = require('unirest');

var errors = require(path.join(__dirname, '..', '..', 'error'));


exports.scrapeMarks = function (RegNo, sem, callback) {
    var marksUri = 'http://27.251.102.132/parent/marks.asp?sem=' + sem;
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
            var marks = [];
            try {
                var scraper = cheerio.load(response.body);
                var PBL = false;
                var scraperPBL;
                var CBL = true;
                if (scraper('table table').length > 1) {
                    PBL = true;
                    scraperPBL = cheerio.load(scraper('table table').eq(1).html());
                }
                else if (scraper('u').eq(1).text().substring(0, 3) === 'PBL') {
                    PBL = true;
                    scraperPBL = cheerio.load(scraper('table table').eq(0).html());
                    CBL = false;
                }
                scraper = cheerio.load(scraper('table table').eq(0).html());
                if (CBL) {
                    var onEach = function (i, elem) {
                        var $ = cheerio.load(scraper(this).html());
                        if (i > 1) {
                            var length = $('td').length;
                            var classnbr = $('td').eq(1).text();
                            if (length == 18) {
                                marks.push({
                                               'class_number': classnbr,
                                               'course_Code': $('td').eq(2).text(),
                                               'course_title': $('td').eq(3).text(),
                                               'course_type': $('td').eq(4).text(),
                                               'cat1': $('td').eq(6).text(),
                                               'cat1_status': $('td').eq(5).text(),
                                               'cat2': $('td').eq(8).text(),
                                               'cat2_status': $('td').eq(7).text(),
                                               'quiz1': $('td').eq(10).text(),
                                               'quiz1_status': $('td').eq(9).text(),
                                               'quiz2': $('td').eq(12).text(),
                                               'quiz2_status': $('td').eq(11).text(),
                                               'quiz3': $('td').eq(14).text(),
                                               'quiz3_status': $('td').eq(13).text(),
                                               'assignment': $('td').eq(16).text(),
                                               'assignment_status': $('td').eq(15).text(),
                                               'type': 'CBL'
                                           });
                            }
                            else if (length == 8) {
                                marks.push({
                                               'class_number': classnbr,
                                               'course_code': $('td').eq(2).text(),
                                               'course_title': $('td').eq(3).text(),
                                               'course_type': $('td').eq(4).text(),
                                               'lab_cam': $('td').eq(7).text(),
                                               'lab_cam_status': $('td').eq(6).text(),
                                               'type': 'Lab'
                                           });
                            }
                            else if (length == 6) {
                                marks.push({
                                               'class_number': classnbr,
                                               'course_code': $('td').eq(2).text(),
                                               'course_title': $('td').eq(3).text(),
                                               'course_type': $('td').eq(4).text(),
                                               'type': 'Project'
                                           });
                            }
                        }
                    };
                    scraper('tr').each(onEach);
                }
                if (PBL) {
                    var pblMarks = [];
                    var onEachPBL = function (i, elem) {
                        var $ = cheerio.load(scraper(this).html());
                        var j = i - 1;
                        var course = Math.floor(j / 7);
                        var row = j % 7;
                        switch (row) {
                            case 0:
                                pblMarks[course] = {
                                    'class_number': $('td').eq(1).text(),
                                    'course_code': $('td').eq(2).text(),
                                    'course_title': $('td').eq(3).text(),
                                    'course_type': $('td').eq(4).text(),
                                    'type': 'PBL',
                                    'details': {
                                        1: {Title: $('td').eq(6).text()},
                                        2: {Title: $('td').eq(7).text()},
                                        3: {Title: $('td').eq(8).text()},
                                        4: {Title: $('td').eq(9).text()},
                                        5: {Title: $('td').eq(10).text()}
                                    }
                                };
                                break;
                            case 1:
                                pblMarks[course].details[1]['Max Marks'] = $('td').eq(1).text();
                                pblMarks[course].details[2]['Max Marks'] = $('td').eq(2).text();
                                pblMarks[course].details[3]['Max Marks'] = $('td').eq(3).text();
                                pblMarks[course].details[4]['Max Marks'] = $('td').eq(4).text();
                                pblMarks[course].details[5]['Max Marks'] = $('td').eq(5).text();
                                break;
                            case 2:
                                pblMarks[course].details[1]['Weightage'] = $('td').eq(1).text();
                                pblMarks[course].details[2]['Weightage'] = $('td').eq(2).text();
                                pblMarks[course].details[3]['Weightage'] = $('td').eq(3).text();
                                pblMarks[course].details[4]['Weightage'] = $('td').eq(4).text();
                                pblMarks[course].details[5]['Weightage'] = $('td').eq(5).text();
                                break;
                            case 3:
                                pblMarks[course].details[1]['Conducted On'] = $('td').eq(1).text();
                                pblMarks[course].details[2]['Conducted On'] = $('td').eq(2).text();
                                pblMarks[course].details[3]['Conducted On'] = $('td').eq(3).text();
                                pblMarks[course].details[4]['Conducted On'] = $('td').eq(4).text();
                                pblMarks[course].details[5]['Conducted On'] = $('td').eq(5).text();
                                break;
                            case 4:
                                pblMarks[course].details[1]['Status'] = $('td').eq(1).text();
                                pblMarks[course].details[2]['Status'] = $('td').eq(2).text();
                                pblMarks[course].details[3]['Status'] = $('td').eq(3).text();
                                pblMarks[course].details[4]['Status'] = $('td').eq(4).text();
                                pblMarks[course].details[5]['Status'] = $('td').eq(5).text();
                                break;
                            case 5:
                                pblMarks[course].details[1]['Scored Mark'] = $('td').eq(1).text();
                                pblMarks[course].details[2]['Scored Mark'] = $('td').eq(2).text();
                                pblMarks[course].details[3]['Scored Mark'] = $('td').eq(3).text();
                                pblMarks[course].details[4]['Scored Mark'] = $('td').eq(4).text();
                                pblMarks[course].details[5]['Scored Mark'] = $('td').eq(5).text();
                                break;
                            case 6:
                                pblMarks[course].details[1]['Scored %'] = $('td').eq(1).text();
                                pblMarks[course].details[2]['Scored %'] = $('td').eq(2).text();
                                pblMarks[course].details[3]['Scored %'] = $('td').eq(3).text();
                                pblMarks[course].details[4]['Scored %'] = $('td').eq(4).text();
                                pblMarks[course].details[5]['Scored %'] = $('td').eq(5).text();
                                break;
                        }
                    };
                    scraperPBL('tr').each(onEachPBL);
                    marks = marks.concat(pblMarks)
                }
                callback(null, marks);
            }
            catch (ex) {
                // Scraping Marks failed
                callback(false, [
                    {Error: errors.codes.Invalid}
                ]);
            }
        }
    };
    CookieJar.add(unirest.cookie(cookieSerial), marksUri);
    unirest.post(marksUri)
        .jar(CookieJar)
        .end(onRequest);
};
