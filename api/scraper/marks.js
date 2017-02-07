/*
 *  VITacademics
 *  Copyright (C) 2014-2016  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014-2016  Ayush Agarwal <agarwalayush161@gmail.com>
 *
 *  This file is part of VITacademics.
 *
 *  VITacademics is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  VITacademics is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with VITacademics.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const cache = require('memory-cache');
const cheerio = require('cheerio');
const moment = require('moment');
const path = require('path');
const unirest = require('unirest');

const status = require(path.join(__dirname, '..', '..', 'status'));


exports.scrapeMarks = function (app, data, callback) {
  let marksUri;
  if (data.campus === 'vellore') {
    marksUri = 'https://vtop.vit.ac.in/parent/marks.asp?sem=' + data.semester;
  }
  else if (data.campus === 'chennai') {
    marksUri = 'http://academicscc.vit.ac.in/parent/marks.asp?sem=' + data.semester;
  }
  const CookieJar = unirest.jar();
  const cookieSerial = cache.get(data.reg_no).cookie;
  const onRequest = function (response) {
    if (response.error) {
      callback(false, [
        status.vitDown
      ]);
    }
    else {
      let marks = [];
      try {
        let $ = cheerio.load(response.body, {
          normalizeWhitespace: true
        });

        let marks = $("table").eq(1).find("tr[bgcolor='#EDEADE']").map((i, element) => {

          let course_marks = $(element).next().find("table").find("tr[bgcolor='#CCCCCC']").map((j, e) => {

            let td = $(e).find("td");
            return {
              title: td.eq(1).text().trim(),
              max_marks: parseFloat(td.eq(2).text()),
              weightage: parseFloat(td.eq(3).text()),
              conducted_on: "Tentative, set by course faculty",
              status: td.eq(4).text(),
              scored_marks: parseFloat(td.eq(5).text()),
              scored_percentage: parseFloat(td.eq(6).text())
            };

          }).get();

          let td = $(element).find("td");
          return {
            class_number: parseInt(td.eq(1).text()),
            course_code: td.eq(2).text(),
            course_title: td.eq(3).text(),
            course_type: td.eq(6).text(),
            marks: course_marks
          }

        }).get();
        callback(null, marks);

      }
      catch (ex) {
        data.status = status.dataParsing;
        callback(false, [
          data
        ]);
      }
    }
  };
  CookieJar.add(unirest.cookie(cookieSerial), marksUri);
  unirest.post(marksUri)
    .jar(CookieJar)
    .timeout(28000)
    .end(onRequest);
};
