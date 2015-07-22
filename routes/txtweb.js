/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *
 *  This file is part of VITacademics.
 *
 *  VITacademics is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  VITacademics is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with VITacademics.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const express = require('express');
const path = require('path');

const config = require(path.join(__dirname, '..', 'config'));
const status = require(path.join(__dirname, '..', 'status'));

const api_txtweb = require(path.join(__dirname, '..', 'api', 'txtweb'));

const router = express.Router();

router.get('/', function (req, res) {
  if (req.query['txtweb-message'] && req.query['txtweb-mobile']) {
    const args = req.query['txtweb-message'].toUpperCase().split(' ');
    const app = {
      dbs: req.dbs,
      queue: req.queue
    };
    const data = {
      args: args,
      mobile: req.query['txtweb-mobile']
    };
    const onGet = function (err, messages) {
      res.render('txtweb', {
        googleAnalyticsToken: config.googleAnalyticsToken,
        messages: messages,
        instructions: false,
        txtWebAppKey: config.txtWebAppKey
      });
    };
    api_txtweb.parseMessage(app, data, onGet);
  }
  else {
    const messages = [
      'Register with the VITacademics SMS Service: @vitacademics register [Campus] [RegNo] [DoB]',
      'Get Course Details:  @vitacademics course [CourseCode]',
      'Get Today\'s Classes: @vitacademics today',
      'Get Attendance: @vitacademics attendance',
      'Get Marks: @vitacademics marks',
      'Help - @vitacademics help'
    ];
    res.render('txtweb', {
      googleAnalyticsToken: config.googleAnalyticsToken,
      messages: messages,
      instructions: true,
      txtWebAppKey: config.txtWebAppKey
    });
  }
});

module.exports = router;
