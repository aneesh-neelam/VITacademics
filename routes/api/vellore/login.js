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

var api_login = require('../../../api/vellore/login/get');
var api_captcha = require('../../../api/vellore/login/captcha');
var api_submit = require('../../../api/vellore/login/submit');
var express = require('express');
var router = express.Router();

router.get('/manual', function (req, res)
{
    var RegNo = req.query.regno;
    var onGetCaptcha = function (err, captchaResponse)
    {
        if (err) res.send(captchaResponse);
        else
        {
            res.writeHead(200, {'Content-Type': 'image/bmp'});
            res.write(captchaResponse);
            res.end();
        }
    };
    api_login.getCaptcha(RegNo, onGetCaptcha);
});

router.get('/auto', function (req, res)
{
    var RegNo = req.query.regno;
    var DoB = req.query.dob;
    /*
     login(doc, function (callback) {
     callback();
     });
     */
    res.send('Captchaless login!');
});

router.get('/submit', function (req, res)
{
    var RegNo = req.query.regno;
    var DoB = req.query.dob;
    var Captcha = req.query.captcha;
    var onSubmit = function (err, loginResponse)
    {
        if (err) res.send(loginResponse);
        else res.send(loginResponse);
    };
    api_submit.submitCaptcha(RegNo, DoB, Captcha, onSubmit);
});

module.exports = router;