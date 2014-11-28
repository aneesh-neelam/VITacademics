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

var path = require('path');

var api_login = require(path.join(__dirname, '..', '..', 'api', 'chennai', 'login', 'get'));
var api_captcha = require(path.join(__dirname, '..', '..', 'api', 'chennai', 'login', 'auto'));
var api_submit = require(path.join(__dirname, '..', '..', 'api', 'chennai', 'login', 'submit'));
var api_data = require(path.join(__dirname, '..', '..', 'api', 'chennai', 'scraper', 'aggregate'));
var api_friends_generate = require(path.join(__dirname, '..', '..', 'api', 'chennai', 'friends', 'generate'));
var api_friends_share = require(path.join(__dirname, '..', '..', 'api', 'chennai', 'friends', 'share'));

// TODO tests
