/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
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
              callback(true, data);
          }
          else {
              var baseScraper = cheerio.load(response.body);
              var coursesLength = baseScraper('table #hist tr').length;
              courses = [];
              for(var i = 0; i < coursesLength; i++) {
                var attrsLength = baseScraper('table #hist tr').eq(i).children('td').length;
                var attrs = baseScraper('table #hist tr').eq(i).children('td');
                var course = {'course_code': attrs.eq(1).text(),
                              'course_title': attrs.eq(2).text(),
                              'course_type': attrs.eq(3).text(),
                              'credits': attrs.eq(4).text(),
                              'grade': attrs.eq(5).text(),
                              'exam_held': attrs.eq(6).text(),
                              'result_date': attrs.eq(7).text(),
                              'option': attrs.eq(8).text()};
                courses.push(course);
              }

              //Scraping the credit information
              var creditsTable = baseScraper('table table').eq(2).children('tr').eq(1);
              data.credits_registered = parseInt(creditsTable.children('td').eq(0).text());
              data.credits_earned = parseInt(creditsTable.children('td').eq(1).text());
              data.cgpa = parseFloat(creditsTable.children('td').eq(2).text().trim());

              //Scraping the grade summary information
              var gradeSummaryTable = baseScraper('table table').eq(3).children('tr').eq(1);
              grade_summary = {};
              grade_summary.s = parseInt(gradeSummaryTable.children('td').eq(0).text());
              grade_summary.a = parseInt(gradeSummaryTable.children('td').eq(1).text());
              grade_summary.b = parseInt(gradeSummaryTable.children('td').eq(2).text());
              grade_summary.c = parseInt(gradeSummaryTable.children('td').eq(3).text());
              grade_summary.d = parseInt(gradeSummaryTable.children('td').eq(4).text());
              grade_summary.e = parseInt(gradeSummaryTable.children('td').eq(5).text());
              grade_summary.f = parseInt(gradeSummaryTable.children('td').eq(6).text());
              grade_summary.n = parseInt(gradeSummaryTable.children('td').eq(7).text());
              data.grade_summary = grade_summary;
              data.courses = courses;
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
