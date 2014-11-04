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
// var fs = require('fs');

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
            try {
                var pixelMap = getPixelMap(captchaImage);
                /*
                 console.log(pixelMap.length);
                 for(var i = 0; i < pixelMap.length; ++i) {
                 console.log(pixelMap[i].length);
                 }
                 // Uncomment require('fs') at the top
                 fs.writeFile('pixel-map.json', pixelMap, function(err)
                 {
                 if(err) throw err;
                 console.log('Pixel Map saved to file: pixel-map.json');
                 });
                 */
                var tmp_captcha = '123456';
                submit.submitCaptcha(RegNo, DoB, tmp_captcha, callback);
            }
            catch (ex) {
                data.Error = errors.CaptchaParsing;
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

var getPixelMap = function (bitmapBuffer) {
    var pixelMap = [];
    var subArray = [];
    var row = 0;
    for (var i = bitmapBuffer.length - (25 * 132), r = 0; i < bitmapBuffer.length; ++i, ++r) {
        if (Math.floor(r / 132) !== row) {
            row = Math.floor(r / 132);
            pixelMap.push(subArray);
            subArray = [];
        }
        subArray.push(bitmapBuffer.readUInt8(i));
    }
    pixelMap.push(subArray);
    return pixelMap;
};
