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

var express = require('express');
var path = require('path');
var router = express.Router();

var api_login = require(path.join(__dirname, '..', '..', '..', 'api', 'chennai', 'login', 'get'));
var api_captcha = require(path.join(__dirname, '..', '..', '..', 'api', 'chennai', 'login', 'auto'));
var api_submit = require(path.join(__dirname, '..', '..', '..', 'api', 'chennai', 'login', 'submit'));


router.get('/manual', function (req, res) {
    var RegNo = req.query.regno;
    var onGetCaptcha = function (err, captchaResponse) {
        if (err) {
            res.send(captchaResponse);
        }
        else {
            res.writeHead(200, {'Content-Type': 'image/bmp'});
            res.write(captchaResponse);
            res.end();
        }
    };
    api_login.getCaptcha(RegNo.toUpperCase(), onGetCaptcha);
});

router.get('/auto', function (req, res) {
    var RegNo = req.query.regno;
    var DoB = req.query.dob;
    var onSubmit = function (err, loginResponse) {
        if (err) {
            res.send(loginResponse);
        }
        else {
            res.send(loginResponse);
        }
    };
    api_captcha.autologin(RegNo.toUpperCase(), DoB, onSubmit);
});

router.get('/submit', function (req, res) {
    var RegNo = req.query.regno;
    var DoB = req.query.dob;
    var Captcha = req.query.captcha;
    var onSubmit = function (err, loginResponse) {
        if (err) {
            res.send(loginResponse);
        }
        else {
            res.send(loginResponse);
        }
    };
    api_submit.submitCaptcha(RegNo.toUpperCase(), DoB, Captcha.toUpperCase(), onSubmit);
});

module.exports = router;
