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
    var myCookie = cache.get(RegNo);
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
                if (scraper('table table').length > 1) {
                    PBL = true;
                    scraperPBL = cheerio.load(scraper('table table').eq(1).html());
                }
                scraper = cheerio.load(scraper('table table').eq(0).html());
                var onEach = function (i, elem) {
                    var $ = cheerio.load(scraper(this).html());
                    if (i > 1) {
                        var length = $('td').length;
                        var classnbr = $('td').eq(1).text();
                        if (length == 18) {
                            marks.push({
                                           'Class Number': classnbr,
                                           'Course Code': $('td').eq(2).text(),
                                           'Course Title': $('td').eq(3).text(),
                                           'Course Type': $('td').eq(4).text(),
                                           'CAT I': $('td').eq(6).text(),
                                           'CAT I Status': $('td').eq(5).text(),
                                           'CAT II': $('td').eq(8).text(),
                                           'CAT II Status': $('td').eq(7).text(),
                                           'Quiz I': $('td').eq(10).text(),
                                           'Quiz I Status': $('td').eq(9).text(),
                                           'Quiz II': $('td').eq(12).text(),
                                           'Quiz II Status': $('td').eq(11).text(),
                                           'Quiz III': $('td').eq(14).text(),
                                           'Quiz III Status': $('td').eq(13).text(),
                                           'Assignment': $('td').eq(16).text(),
                                           'Assignment Status': $('td').eq(15).text(),
                                           'Type': 'CBL'
                                       });
                        }
                        else if (length == 8) {
                            marks.push({
                                           'Class Number': classnbr,
                                           'Course Code': $('td').eq(2).text(),
                                           'Course Title': $('td').eq(3).text(),
                                           'Course Type': $('td').eq(4).text(),
                                           'Lab CAM': $('td').eq(7).text(),
                                           'Lab CAM Status': $('td').eq(6).text(),
                                           'Type': 'Lab'
                                       });
                        }
                        else if (length == 6) {
                            marks.push({
                                           'Class Number': classnbr,
                                           'Course Code': $('td').eq(2).text(),
                                           'Course Title': $('td').eq(3).text(),
                                           'Course Type': $('td').eq(4).text(),
                                           'Type': 'Project'
                                       });
                        }
                    }
                };
                scraper('tr').each(onEach);
                if (PBL) {
                    var pblMarks = [];
                    var onEachPBL = function (i, elem) {
                        var $ = cheerio.load(scraper(this).html());
                        var course = Math.floor(i / 8);
                        var row = i % 8;
                        switch (row) {
                            case 1:
                                pblMarks[course] = {
                                    'Class Number': $('td').eq(1).text(),
                                    'Course Code': $('td').eq(2).text(),
                                    'Course Title': $('td').eq(3).text(),
                                    'Course Type': $('td').eq(4).text(),
                                    'Type': 'PBL',
                                    'Details': {
                                        1: {Title: $('td').eq(6).text()},
                                        2: {Title: $('td').eq(7).text()},
                                        3: {Title: $('td').eq(8).text()},
                                        4: {Title: $('td').eq(9).text()},
                                        5: {Title: $('td').eq(10).text()}
                                    }
                                };
                                break;
                            case 2:
                                pblMarks[course].Details[1]['Max Marks'] = $('td').eq(1).text();
                                pblMarks[course].Details[2]['Max Marks'] = $('td').eq(2).text();
                                pblMarks[course].Details[3]['Max Marks'] = $('td').eq(3).text();
                                pblMarks[course].Details[4]['Max Marks'] = $('td').eq(4).text();
                                pblMarks[course].Details[5]['Max Marks'] = $('td').eq(5).text();
                                break;
                            case 3:
                                pblMarks[course].Details[1]['Weightage'] = $('td').eq(1).text();
                                pblMarks[course].Details[2]['Weightage'] = $('td').eq(2).text();
                                pblMarks[course].Details[3]['Weightage'] = $('td').eq(3).text();
                                pblMarks[course].Details[4]['Weightage'] = $('td').eq(4).text();
                                pblMarks[course].Details[5]['Weightage'] = $('td').eq(5).text();
                                break;
                            case 4:
                                pblMarks[course].Details[1]['Conducted On'] = $('td').eq(1).text();
                                pblMarks[course].Details[2]['Conducted On'] = $('td').eq(2).text();
                                pblMarks[course].Details[3]['Conducted On'] = $('td').eq(3).text();
                                pblMarks[course].Details[4]['Conducted On'] = $('td').eq(4).text();
                                pblMarks[course].Details[5]['Conducted On'] = $('td').eq(5).text();
                                break;
                            case 5:
                                pblMarks[course].Details[1]['Status'] = $('td').eq(1).text();
                                pblMarks[course].Details[2]['Status'] = $('td').eq(2).text();
                                pblMarks[course].Details[3]['Status'] = $('td').eq(3).text();
                                pblMarks[course].Details[4]['Status'] = $('td').eq(4).text();
                                pblMarks[course].Details[5]['Status'] = $('td').eq(5).text();
                                break;
                            case 6:
                                pblMarks[course].Details[1]['Scored Mark'] = $('td').eq(1).text();
                                pblMarks[course].Details[2]['Scored Mark'] = $('td').eq(2).text();
                                pblMarks[course].Details[3]['Scored Mark'] = $('td').eq(3).text();
                                pblMarks[course].Details[4]['Scored Mark'] = $('td').eq(4).text();
                                pblMarks[course].Details[5]['Scored Mark'] = $('td').eq(5).text();
                                break;
                            case 7:
                                pblMarks[course].Details[1]['Scored %'] = $('td').eq(1).text();
                                pblMarks[course].Details[2]['Scored %'] = $('td').eq(2).text();
                                pblMarks[course].Details[3]['Scored %'] = $('td').eq(3).text();
                                pblMarks[course].Details[4]['Scored %'] = $('td').eq(4).text();
                                pblMarks[course].Details[5]['Scored %'] = $('td').eq(5).text();
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
