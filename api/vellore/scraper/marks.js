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
    // TODO Scrape Marks
    var marks = {Error: errors.codes.ToDo};
    callback(null, marks);
};