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

var debug = require('debug')('VITacademics');
var path = require('path');

var errors = require(path.join(__dirname, '..', 'error'));
var login = require(path.join(__dirname, 'get'));
var submit = require(path.join(__dirname, 'submit'));

exports.autologin = function (RegNo, DoB, callback)
{
    var parseCaptcha = function (err, captchaImage)
    {
        if (err) callback(true, captchaImage);
        else
        {
            // TODO Parse Captcha
            var tmp_captcha = '123456';
            submit.submitCaptcha(RegNo, DoB, tmp_captcha, callback);
        }
    };
    login.getCaptcha(RegNo, parseCaptcha);
};