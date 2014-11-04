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

var bitmap = require('node-bitmap');
var path = require('path');
var fs = require('fs');

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var errors = require(path.join(__dirname, '..', '..', 'error'));
var login = require(path.join(__dirname, 'get'));
var submit = require(path.join(__dirname, 'submit'));

exports.autoLogin = function (RegNo, DoB, callback) {
    var data = {
        RegNo: RegNo
    };
    var parseCaptcha = function (err, captchaImage) {
        if (err) {
            callback(true, captchaImage);
        }
        else {
            // var captchaBitmap = new bitmap(captchaImage);
            // captchaBitmap.init();
            console.log(captchaImage.length);
            var captchaJson = [];
            for (var i = captchaImage.length - (25 * 132); i < captchaImage.length; i++) {
                captchaJson.push(captchaImage.readUInt8(i));
            }
            // var captchaJson = JSON.stringify(captchaBitmap.read(captchaBitmap.buffer, (captchaBitmap.buffer.length - (25 * 132)), 25 * 132));
            console.log(captchaJson.length);
            /*
             var pixelMap = [];
             for (var i = 0, len = captchaJson.length; i < len; i += 132) {
             pixelMap.push(captchaJson.slice(i, i + 132));
             }
             fs.writeFile('pixels.json', pixelMap, function (err) {
             if (err) throw err;
             });
             */
            try {
                // TODO Parse Captcha
                var tmp_captcha = '123456';
                submit.submitCaptcha(RegNo, DoB, tmp_captcha, callback);
            }
            catch (ex) {
                data.Error = errors.CaptchaParsing;
                if (log) {
                    log.log('debug', data);
                }
                console.log('Captcha Parsing Error');
                callback(true, data);
            }
        }
    };
    login.getCaptcha(RegNo, parseCaptcha);
};
