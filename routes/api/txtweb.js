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

var api_txtweb = require(path.join(__dirname, '..', '..', 'api', 'txtweb'));

router.get('/', function (req, res) {
    var message = req.query['txtweb-message'];
    var mobileHash = req.query['txtweb-mobile'];
    var GoogleAnalytics = process.env.GOOGLE_ANALYTICS || 'UA-35429946-2';
    if (message && mobileHash) {
        var onGet = function (err, messages) {
            if (err) {
                res.render('txtweb', {GoogleAnalytics: GoogleAnalytics, messages: messages, instructions: false});
            }
            else {
                res.render('txtweb', {GoogleAnalytics: GoogleAnalytics, messages: messages, instructions: false});
            }
        };
        api_txtweb.parseMessage(message, mobileHash, onGet);
    }
    else {
        var messages = [
            'Register with the VITacademics SMS Service: @vitacademics register [Campus] [RegNo] [DoB]',
            'Get Course Details:  @vitacademics course [CourseCode]',
            'Get Today\'s Classes: @vitacademics today',
            'Get Attendance: @vitacademics attendance',
            'Get Marks: @vitacademics marks',
            'Help - @vitacademics help'
        ];
        res.render('txtweb', {GoogleAnalytics: GoogleAnalytics, messages: messages, instructions: true});
    }
});

module.exports = router;
