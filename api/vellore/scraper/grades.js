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


exports.scrapeGrades = function (RegNo, sem, callback) {
    var data = {RegNo: RegNo};
    if (cache.get(RegNo) !== null) {
        var Sem = sem || process.env.VELLORE_PREVIOUS_SEMESTER || 'WS';
        var timetableUri = 'https://academics.vit.ac.in/parent/grade.asp?sem=' + Sem;
        var CookieJar = unirest.jar();
        var myCookie = cache.get(RegNo);
        var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
        var onRequest = function (response) {
            if (response.error) {
                callback(true, {Error: errors.codes.Down});
            }
            else {
                // TODO Grades
                callback(null, 'Nothing');
            }
        };
        CookieJar.add(unirest.cookie(cookieSerial), timetableUri);
        unirest.post(timetableUri)
            .jar(CookieJar)
            .end(onRequest);
    }
    else {
        data.Error = errors.codes.TimedOut;
        callback(true, data);
    }
};
