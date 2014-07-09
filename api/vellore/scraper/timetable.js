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
var cache = require('memory-cache');
var cheerio = require('cheerio');
var cookie = require('cookie');
var unirest = require('unirest');

exports.scrapeTimetable = function (RegNo, sem, firsttime, callback)
{
    var timetableUri = 'https://academics.vit.ac.in/parent/timetable.asp?sem=' + sem;
    var CookieJar = unirest.jar();
    var myCookie = cache.get(RegNo);
    var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
    var onRequest = function (response)
    {
        if (response.error) callback(true, errors.codes.Down);
        else
        {
            var timetable = [];
            try
            {
                var scraper = cheerio.load(response.body);
                scraper = cheerio.load(scraper('table table').eq(0).html());
                var length = scraper('tr').length;
                var onEach = function (i, elem)
                {
                    var $ = cheerio.load(scraper(this).html());
                    if (i > 0 && i < (length - 1))
                    {
                        var classnbr = $('td').eq(1).text();
                        var code = $('td').eq(2).text();
                        var title = $('td').eq(3).text();
                        var type = $('td').eq(4).text();
                        var LTPC = $('td').eq(5).text();
                        var mode = $('td').eq(6).text();
                        var option = $('td').eq(7).text();
                        var slot = $('td').eq(8).text();
                        var venue = $('td').eq(9).text();
                        var faculty = $('td').eq(10).text();
                        var status = $('td').eq(11).text();
                        var doc = {
                            'Class Number': classnbr,
                            'Course Code': code,
                            'Course Title': title,
                            'Course Type': type,
                            'LTPC': LTPC,
                            'Course Mode': mode,
                            'Course Option': option,
                            'Slot': slot,
                            'Venue': venue,
                            'Faculty': faculty,
                            'Registration Status': status
                        };
                        timetable.push(doc);
                    }
                };
                scraper('tr').each(onEach);
                callback(null, timetable);
                // TODO Timetable
            }
            catch (ex)
            {
                // Scraping Timetable failed
                callback(true, {Error: errors.codes.Invalid});
            }
        }
    };
    CookieJar.add(unirest.cookie(cookieSerial), timetableUri);
    unirest.post(timetableUri)
        .jar(CookieJar)
        .end(onRequest);
};