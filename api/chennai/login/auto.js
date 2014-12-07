/*
 *  VITacademics
 *  Copyright (C) 2014  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014  Karthik Balakrishnan <karthikb351@gmail.com>
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

var captchaParser = require(path.join(__dirname, 'captcha-parser'));

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var status = require(path.join(__dirname, '..', '..', 'status'));
var login = require(path.join(__dirname, 'get'));
var submit = require(path.join(__dirname, 'submit'));


exports.autoLogin = function (RegNo, DoB, callback) {
    var data = {
        reg_no: RegNo
    };
    var parseCaptcha = function (err, captchaImage) {
        if (err) {
            callback(true, captchaImage);
        }
        else {
            try {
                var captcha = captchaParser.parseBuffer(captchaImage);
                submit.submitCaptcha(RegNo, DoB, captcha, callback);
            }
            catch (ex) {
                data.status = status.captchaParsing;
                if (log) {
                    log.log('debug', data);
                }
                console.log('Captcha Parsing Error');
                callback(true, null);
            }
        }
    };
    login.getCaptcha(RegNo, parseCaptcha);
};
