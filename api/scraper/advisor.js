/*
 *  VITacademics
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

'use strict';

var cheerio = require('cheerio');
var cache = require('memory-cache');
var path = require('path');
var unirest = require('unirest');

var status = require(path.join(__dirname, '..', '..', 'status'));

exports.get = function (app, data, callback) {
    let advisorUri;
    if (data.campus === 'vellore') {
        advisorUri = 'https://academics.vit.ac.in/parent/fa_view.asp';
    }
    else {
        advisorUri = 'http://27.251.102.132/parent/proctor_view.asp';
    }
    var CookieJar = unirest.jar();
    var onPost = function (response) {
        if (response.error) {
            callback(true, null);
        }
        else {
            var faculty = {};
            var scraper = cheerio.load(response.body);
            scraper = cheerio.load(scraper('table table').eq(0).html());
            var onEach = function (i, element) {
                var htmlRow = cheerio.load(scraper(this).html());
                var htmlColumn = htmlRow('td');
                if (i > 0) {
                    let key = htmlColumn.eq(0).text().toLowerCase().replace(' ', '_');
                    let value = htmlColumn.eq(1).text();
                    if (key !== '_') {
                        faculty[key] = value;
                    }
                }
            };
            scraper('tr').each(onEach);
            console.log(faculty);
        }
    }
    let cookieSerial = cache.get(data.reg_no).cookie;
    CookieJar.add(unirest.cookie(cookieSerial), advisorUri);
    unirest.post(advisorUri)
        .jar(CookieJar)
        .end(onPost);
};
