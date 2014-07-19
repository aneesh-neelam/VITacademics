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

exports.scrapeMarks = function (RegNo, sem, callback)
{
    var marksUri = 'https://academics.vit.ac.in/parent/marks.asp?sem=' + sem;
    var CookieJar = unirest.jar();
    var myCookie = cache.get(RegNo);
    var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);

    var onRequest = function (response)
    {
        if (response.error) callback(false, [
            {Error: errors.codes.Down}
        ]);
        else
        {
            var marks = [];
            try
            {
                var scraper = cheerio.load(response.body);
                var PBL = false;
                var scraperPBL;
                if (scraper('table table').length > 1)
                {
                    PBL = true;
                    scraperPBL = cheerio.load(scraper('table table').eq(1).html());
                }
                scraper = cheerio.load(scraper('table table').eq(0).html());
                var onEach = function (i, elem)
                {
                    var $ = cheerio.load(scraper(this).html());
                    if (i > 1)
                    {
                        var length = $('td').length;
                        var classnbr = $('td').eq(1).text();
                        if (length == 18)
                        {
                            marks.push({
                                           'Class Number': classnbr,
                                           'Course Code': $('td').eq(2).text(),
                                           'Course Title': $('td').eq(3).text(),
                                           'Course Type': $('td').eq(4).text(),
                                           'CAT I': $('td').eq(6).text(),
                                           'CAT II': $('td').eq(8).text(),
                                           'Quiz I': $('td').eq(10).text(),
                                           'Quiz II': $('td').eq(12).text(),
                                           'Quiz III': $('td').eq(14).text(),
                                           'Assignment': $('td').eq(16).text(),
                                           'Type': 'CBL'
                                       });
                        }
                        else if (length == 8)
                        {
                            marks.push({
                                           'Class Number': classnbr,
                                           'Course Code': $('td').eq(2).text(),
                                           'Course Title': $('td').eq(3).text(),
                                           'Lab CAM': $('td').eq(7).text(),
                                           'Type': 'Lab'
                                       });
                        }
                        else if (length == 6)
                        {
                            marks.push({
                                           'Class Number': classnbr,
                                           'Course Code': $('td').eq(2).text(),
                                           'Course Title': $('td').eq(3).text(),
                                           'Type': 'Project'
                                       });
                        }
                    }
                };
                scraper('tr').each(onEach);
                var pblMarks = [];
                if (PBL)
                {
                    var onEachPBL = function (i, elem)
                    {
                        var row = i % 8;
                    };
                    scraperPBL('tr').each(onEachPBL);
                }
            }

        }
    };


    CookieJar.add(unirest.cookie(cookieSerial), marksUri);
    unirest.post(timetableUri)
        .jar(CookieJar)
        .end(onRequest);

    var marks = [
        {Error: errors.codes.ToDo}
    ];
    callback(null, marks);
};