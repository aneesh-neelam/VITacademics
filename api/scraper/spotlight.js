/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Ayush Agarwal <agarwalayush161@gmail.com>
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

const cheerio = require('cheerio');
const cache = require('memory-cache');
const path = require('path');
const unirest = require('unirest');
const async = require('async');

const config = require(path.join(__dirname, '..', '..', 'config'));

let logentries;
if (config.logentriesEnabled) {
  const LogentriesClient = require('logentries-client');
  logentries = new LogentriesClient({
    token: config.logentriesToken
  });
}

const status = require(path.join(__dirname, '..', '..', 'status'));

exports.get = function (app, data, callback) {
  let spotlightUris;
  data.spotlight = {};
  if (data.campus === 'vellore') {
    spotlightUris = [
      'https://academics.vit.ac.in/include_spotlight_part01.asp',
      'https://academics.vit.ac.in/include_spotlight_part02.asp',
      'https://academics.vit.ac.in/include_spotlight_part03.asp'
    ];
  }
  else if (data.campus === 'chennai') {
    spotlightUris = [
      'http://27.251.102.132/include_spotlight_part01.asp',
      'http://27.251.102.132/include_spotlight_part02.asp',
      'http://27.251.102.132/include_spotlight_part03.asp'
    ];
  }
  const forEach = function (uri, asyncCallback) {
    const onGet = function (response) {
      if (response.error) {
        asyncCallback(false, [
          status.vitDown
        ]);
      }
      else {
        let details = [];
        try {
          try {
            let scraper = cheerio.load(response.body);
            scraper = cheerio.load(scraper('table').eq(0).html());
            //todo - scrape data, format properly, change method of aggregation
            const onEach = function (i, elem) {
              const htmlRow = cheerio.load(scraper(this).html());
              const htmlColumn = cheerio.load(htmlRow('td').html());
              if (htmlColumn('a').eq(0).html() !== null) {
                details.push({
                  text: htmlColumn('a font').text(),
                  url: htmlColumn('a').eq(0).attr('href')
                });
              }
              else if (htmlColumn('p').eq(0).html() !== null) {
                details.push({
                  text: htmlRow('td').text(),
                  url: ''
                });
              }
            };
            scraper('tr').each(onEach);
          }
          catch (ex) {
            details = [];
          }
          data.status = status.success;
        }
        catch (ex) {
          details = [];
          data.status = status.dataParsing;
        }
        asyncCallback(null, details);
      }
    };
    unirest.get(uri)
      .end(onGet);
  };
  const doneScraping = function (err, results) {
    data.spotlight.academics = results[0];
    data.spotlight.coe = results[1];
    data.spotlight.research = results[2];
    callback(null, data);
  };
  async.map(spotlightUris, forEach, doneScraping);
};
