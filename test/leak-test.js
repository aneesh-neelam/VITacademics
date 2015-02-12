#!/usr/bin/env node

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

var memwatch = require('memwatch');
var path = require('path');

var newrelic;
if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE) {
    newrelic = require('newrelic');
}

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

var app = require(path.join(__dirname, '..', 'bin', 'www'));

var log = function (data) {
    console.log(JSON.stringify(data));
    if (log) log.log('info', data);
};

memwatch.on('leak', log);
memwatch.on('stats', log);
