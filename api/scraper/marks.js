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
        let scraper = cheerio.load(response.body);
        let PBL = false;
        let scraperPBL = null;
        let CBL = true;
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
          const onEach = function (i, elem) {
            const htmlColumn = cheerio.load(scraper(this).html())('td');
            if (i > 1) {
              const length = htmlColumn.length;
              const classnbr = parseInt(htmlColumn.eq(1).text());
              if (parseInt(data.reg_no.slice(0, 2)) < 15) {
                if (length == 18) {
                  marks.push({
                    class_number: classnbr,
                    course_code: htmlColumn.eq(2).text(),
                    course_title: htmlColumn.eq(3).text(),
                    course_type: htmlColumn.eq(4).text(),
                    assessments: [
                      {
                        title: "CAT-I",
                        max_marks: 50,
                        weightage: 15,
                        conducted_on: "Check Exam Schedule",
                        status: htmlColumn.eq(5).text(),
                        scored_marks: parseFloat(htmlColumn.eq(6).text()),
                        scored_percentage: Math.round(parseFloat(htmlColumn.eq(6).text()) / 50 * 15 * 1e2) / 1e2
                      },
                      {
                        title: "CAT-II",
                        max_marks: 50,
                        weightage: 15,
                        conducted_on: "Check Exam Schedule",
                        status: htmlColumn.eq(7).text(),
                        scored_marks: parseFloat(htmlColumn.eq(8).text()),
                        scored_percentage: Math.round(parseFloat(htmlColumn.eq(8).text()) / 50 * 15 * 1e2) / 1e2
                      },
                      {
                        title: "Quiz-I",
                        max_marks: 5,
                        weightage: 5,
                        conducted_on: "Tentative, set by course faculty",
                        status: htmlColumn.eq(9).text(),
                        scored_marks: parseFloat(htmlColumn.eq(10).text()),
                        scored_percentage: parseFloat(htmlColumn.eq(10).text())
                      },
                      {
                        title: "Quiz-II",
                        max_marks: 5,
                        weightage: 5,
                        conducted_on: "Tentative, set by course faculty",
                        status: htmlColumn.eq(11).text(),
                        scored_marks: parseFloat(htmlColumn.eq(12).text()),
                        scored_percentage: parseFloat(htmlColumn.eq(12).text())
                      },
                      {
                        title: "Quiz-III",
                        max_marks: 5,
                        weightage: 5,
                        conducted_on: "Tentative, set by course faculty",
                        status: htmlColumn.eq(13).text(),
                        scored_marks: parseFloat(htmlColumn.eq(14).text()),
                        scored_percentage: parseFloat(htmlColumn.eq(14).text())
                      },
                      {
                        title: "Assignment",
                        max_marks: 5,
                        weightage: 5,
                        conducted_on: "Tentative, set by course faculty",
                        status: htmlColumn.eq(15).text(),
                        scored_marks: parseFloat(htmlColumn.eq(16).text()),
                        scored_percentage: parseFloat(htmlColumn.eq(16).text())
                      }
                    ]
                  });
                }
                else if (length == 8) {
                  marks.push({
                    class_number: classnbr,
                    course_code: htmlColumn.eq(2).text(),
                    course_title: htmlColumn.eq(3).text(),
                    course_type: htmlColumn.eq(4).text(),
                    assessments: [
                      {
                        title: "Lab CAM",
                        max_marks: 50,
                        weightage: 50,
                        conducted_on: "Tentative, set by lab faculty",
                        status: htmlColumn.eq(6).text(),
                        scored_marks: parseFloat(htmlColumn.eq(7).text()),
                        scored_percentage: parseFloat(htmlColumn.eq(7).text())
                      }
                    ]
                  });
                }
                else if (length == 6) {
                  marks.push({
                    class_number: classnbr,
                    course_code: htmlColumn.eq(2).text(),
                    course_title: htmlColumn.eq(3).text(),
                    course_type: htmlColumn.eq(4).text(),
                    assessments: []
                  });
                }
              }
              else {
                if (length == 10) {
                  marks.push({
                    class_number: classnbr,
                    course_code: htmlColumn.eq(2).text(),
                    course_title: htmlColumn.eq(3).text(),
                    course_type: htmlColumn.eq(4).text(),
                    assessments: [
                      {
                        title: "CAT-I",
                        max_marks: 50,
                        weightage: 10,
                        conducted_on: "Check Exam Schedule",
                        status: htmlColumn.eq(5).text(),
                        scored_marks: parseFloat(htmlColumn.eq(6).text()),
                        scored_percentage: Math.round(parseFloat(htmlColumn.eq(6).text()) / 50 * 10 * 1e2) / 1e2
                      },
                      {
                        title: "CAT-II",
                        max_marks: 50,
                        weightage: 10,
                        conducted_on: "Check Exam Schedule",
                        status: htmlColumn.eq(7).text(),
                        scored_marks: parseFloat(htmlColumn.eq(8).text()),
                        scored_percentage: Math.round(parseFloat(htmlColumn.eq(8).text()) / 50 * 10 * 1e2) / 1e2
                      },
                      {
                        title: "Digital Assignment",
                        max_marks: 30,
                        weightage: 30,
                        conducted_on: "Tentative, set by faculty",
                        status: "",
                        scored_marks: parseFloat(htmlColumn.eq(9).text()),
                        scored_percentage: parseFloat(htmlColumn.eq(9).text())
                      }
                    ]
                  });
                }
                else if (length == 6) {
                  marks.push({
                    class_number: classnbr,
                    course_code: htmlColumn.eq(2).text(),
                    course_title: htmlColumn.eq(3).text(),
                    course_type: htmlColumn.eq(4).text(),
                    assessments: []
                  });
                }
              }
            }
          };
          scraper('tr').each(onEach);
        }
        if (PBL) {
          const pblMarks = [];
          const onEachPBL = function (i, elem) {
            const htmlColumn = cheerio.load(scraper(this).html())('td');
            const j = i - 1;
            const course = Math.floor(j / 7);
            const row = j % 7;
            switch (row) {
              case 0:
                pblMarks[course] = {
                  class_number: parseInt(htmlColumn.eq(1).text()),
                  course_code: htmlColumn.eq(2).text(),
                  course_title: htmlColumn.eq(3).text(),
                  course_type: htmlColumn.eq(4).text(),
                  assessments: [],
                  pbl_details: {
                    1: {title: htmlColumn.eq(6).text()},
                    2: {title: htmlColumn.eq(7).text()},
                    3: {title: htmlColumn.eq(8).text()},
                    4: {title: htmlColumn.eq(9).text()},
                    5: {title: htmlColumn.eq(10).text()}
                  }
                };
                break;
              case 1:
                pblMarks[course].pbl_details[1]['max_marks'] = parseFloat(htmlColumn.eq(1).text());
                pblMarks[course].pbl_details[2]['max_marks'] = parseFloat(htmlColumn.eq(2).text());
                pblMarks[course].pbl_details[3]['max_marks'] = parseFloat(htmlColumn.eq(3).text());
                pblMarks[course].pbl_details[4]['max_marks'] = parseFloat(htmlColumn.eq(4).text());
                pblMarks[course].pbl_details[5]['max_marks'] = parseFloat(htmlColumn.eq(5).text());
                break;
              case 2:
                pblMarks[course].pbl_details[1]['weightage'] = parseFloat(htmlColumn.eq(1).text());
                pblMarks[course].pbl_details[2]['weightage'] = parseFloat(htmlColumn.eq(2).text());
                pblMarks[course].pbl_details[3]['weightage'] = parseFloat(htmlColumn.eq(3).text());
                pblMarks[course].pbl_details[4]['weightage'] = parseFloat(htmlColumn.eq(4).text());
                pblMarks[course].pbl_details[5]['weightage'] = parseFloat(htmlColumn.eq(5).text());
                break;
              case 3:
                pblMarks[course].pbl_details[1]['conducted_on'] = moment(htmlColumn.eq(1).text(), 'DD-MMM-YYYY').isValid() ? moment(htmlColumn.eq(1).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD') : null;
                pblMarks[course].pbl_details[2]['conducted_on'] = moment(htmlColumn.eq(2).text(), 'DD-MMM-YYYY').isValid() ? moment(htmlColumn.eq(2).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD') : null;
                pblMarks[course].pbl_details[3]['conducted_on'] = moment(htmlColumn.eq(3).text(), 'DD-MMM-YYYY').isValid() ? moment(htmlColumn.eq(3).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD') : null;
                pblMarks[course].pbl_details[4]['conducted_on'] = moment(htmlColumn.eq(4).text(), 'DD-MMM-YYYY').isValid() ? moment(htmlColumn.eq(4).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD') : null;
                pblMarks[course].pbl_details[5]['conducted_on'] = moment(htmlColumn.eq(5).text(), 'DD-MMM-YYYY').isValid() ? moment(htmlColumn.eq(5).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD') : null;
                break;
              case 4:
                pblMarks[course].pbl_details[1]['status'] = htmlColumn.eq(1).text();
                pblMarks[course].pbl_details[2]['status'] = htmlColumn.eq(2).text();
                pblMarks[course].pbl_details[3]['status'] = htmlColumn.eq(3).text();
                pblMarks[course].pbl_details[4]['status'] = htmlColumn.eq(4).text();
                pblMarks[course].pbl_details[5]['status'] = htmlColumn.eq(5).text();
                break;
              case 5:
                pblMarks[course].pbl_details[1]['scored_marks'] = parseFloat(htmlColumn.eq(1).text());
                pblMarks[course].pbl_details[2]['scored_marks'] = parseFloat(htmlColumn.eq(2).text());
                pblMarks[course].pbl_details[3]['scored_marks'] = parseFloat(htmlColumn.eq(3).text());
                pblMarks[course].pbl_details[4]['scored_marks'] = parseFloat(htmlColumn.eq(4).text());
                pblMarks[course].pbl_details[5]['scored_marks'] = parseFloat(htmlColumn.eq(5).text());
                break;
              case 6:
                pblMarks[course].pbl_details[1]['scored_percentage'] = parseFloat(htmlColumn.eq(1).text());
                pblMarks[course].pbl_details[2]['scored_percentage'] = parseFloat(htmlColumn.eq(2).text());
                pblMarks[course].pbl_details[3]['scored_percentage'] = parseFloat(htmlColumn.eq(3).text());
                pblMarks[course].pbl_details[4]['scored_percentage'] = parseFloat(htmlColumn.eq(4).text());
                pblMarks[course].pbl_details[5]['scored_percentage'] = parseFloat(htmlColumn.eq(5).text());
                break;
            }
          };
          scraperPBL('tr').each(onEachPBL);
          marks = marks.concat(pblMarks);
        }
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
