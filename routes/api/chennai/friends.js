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

var api_friends_generate = require(path.join(__dirname, '..', '..', '..', 'api', 'chennai', 'friends', 'generate'));
var api_friends_share = require(path.join(__dirname, '..', '..', '..', 'api', 'chennai', 'friends', 'share'));


router.get('/regenerate', function (req, res) {
    var RegNo = req.query.regno;
    var DoB = req.query.dob;
    var onGetToken = function (err, data) {
        res.send(data);
    };
    api_friends_generate.getToken(RegNo.toUpperCase(), DoB, onGetToken)
});

router.get('/share', function (req, res) {
    var onGetTimetable = function (err, data) {
        res.send(data);
    };
    if (req.query.token) {
        var token = req.query.token;
        api_friends_share.getTimetableToken(token, onGetTimetable)
    }
    else if (req.query.regno && req.query.dob) {
        var RegNo = req.query.regno;
        var DoB = req.query.dob;

        api_friends_share.getTimetableDoB(RegNo.toUpperCase(), DoB, onGetTimetable)
    }
});

module.exports = router;
