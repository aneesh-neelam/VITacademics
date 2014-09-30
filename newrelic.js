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

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE) {
    var app_name = process.env.NEWRELIC_APP_NAME;
    var license = process.env.NEWRELIC_LICENSE;
    if (log) {
        log.info('Using New Relic');
    }
    console.log('Using New Relic');
}

exports.config = {
    app_name: [app_name],
    license_key: license,
    logging: {
        level: 'info'
    }
};
