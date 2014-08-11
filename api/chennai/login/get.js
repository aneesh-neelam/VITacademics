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

var cache = require('memory-cache');
var path = require('path');
var unirest = require('unirest');

var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var errors = require(path.join(__dirname, '..', '..', 'error'));


exports.getCaptcha = function (RegNo, callback)
{
    var captchaUri = 'http://27.251.102.132/parent/captcha.asp';
    var data = {
        RegNo: RegNo
    };
    var onRequest = function (response)
    {
        if (response.error)
        {
            data.Error = errors.codes.Down;
            if (log)
                log.log('debug', data);
            console.log('VIT Academics connection failed');
            callback(true, data);
        }
        else
        {
            var validity = 2; // In Minutes
            var myCookie = [];
            var onEach = function (key)
            {
                var regEx = new RegExp('ASPSESSION');
                if (regEx.test(key))
                {
                    myCookie[0] = key;
                    myCookie[1] = response.cookies[key];
                    return false;
                }
                return true;
            };
            Object.keys(response.cookies).forEach(onEach);
            cache.put(RegNo, myCookie, validity * 60 * 1000);
            callback(null, response.body);
        }
    };
    unirest.get(captchaUri)
        .encoding(null)
        .set('Content-Type', 'image/bmp')
        .end(onRequest);
};