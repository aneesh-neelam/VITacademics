/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2015  Kishore Narendran <kishore.narendran09@gmail.com>
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

var cache = require('memory-cache');
var cheerio = require('cheerio');
var cookie = require('cookie');
var moment = require('moment');
var path = require('path');
var unirest = require('unirest');

var status = require(path.join(__dirname, '..', 'status'));


exports.get = function (app, data, callback) {
  var gradesUri;
  if (data.campus === 'vellore') {
    gradesUri = 'https://academics.vit.ac.in/parent/student_history.asp';
  }
  else if (data.campus === 'chennai') {
    gradesUri = 'http://27.251.102.132/parent/student_history.asp';
  }
  var CookieJar = unirest.jar();
  var cookieSerial = cache.get(data.reg_no).cookie;
  var onRequest = function (response) {
    if (response.error) {
      data.status = status.codes.vitDown;
      console.log(JSON.stringify(data));
      callback(true, data);
    }
    else {
      var baseScraper = cheerio.load(response.body);
      data.courses = [];
      var onEach = function (i, elem) {
        if (i > 0) {
          var attrs = baseScraper(this).children('td');
          data.courses.push({
            'course_code': attrs.eq(1).text(),
            'course_title': attrs.eq(2).text(),
            'course_type': attrs.eq(3).text(),
            'credits': parseInt(attrs.eq(4).text()),
            'grade': attrs.eq(5).text(),
            'exam_held': moment(attrs.eq(6).text(), 'MMM-YYYY').format('YYYY-MM'),
            'result_date': moment(attrs.eq(7).text(), 'DD-MMM-YYYY').isValid() ? moment(attrs.eq(7).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD') : null,
            'option': attrs.eq(8).text()
          });
        }
      };
      baseScraper('table #hist tr').each(onEach);

      //Scraping the credit information
      var creditsTable = baseScraper('table table').eq(2).children('tr').eq(1);
      data.credits_registered = parseInt(creditsTable.children('td').eq(0).text());
      data.credits_earned = parseInt(creditsTable.children('td').eq(1).text());
      data.cgpa = parseFloat(creditsTable.children('td').eq(2).text().trim());

      //Scraping the grade summary information
      var gradeSummaryTable = baseScraper('table table').eq(3).children('tr').eq(1);
      data.grade_summary = {
        s: parseInt(gradeSummaryTable.children('td').eq(0).text()),
        a: parseInt(gradeSummaryTable.children('td').eq(1).text()),
        b: parseInt(gradeSummaryTable.children('td').eq(2).text()),
        c: parseInt(gradeSummaryTable.children('td').eq(3).text()),
        d: parseInt(gradeSummaryTable.children('td').eq(4).text()),
        e: parseInt(gradeSummaryTable.children('td').eq(5).text()),
        f: parseInt(gradeSummaryTable.children('td').eq(6).text()),
        n: parseInt(gradeSummaryTable.children('td').eq(7).text())
      };

      data.status = status.codes.success;
      callback(true, data);
    }
  };
  CookieJar.add(unirest.cookie(cookieSerial), gradesUri);
  unirest.post(gradesUri)
    .jar(CookieJar)
    .timeout(28000)
    .end(onRequest);
};
