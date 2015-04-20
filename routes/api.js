/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
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

'use strict';

var cache = require('memory-cache');
var express = require('express');
var path = require('path');

var db = require(path.join(__dirname, '..', 'db'));
var loginAuto = require(path.join(__dirname, '..', 'api', 'login', 'auto'));
var dataAggregate = require(path.join(__dirname, '..', 'api', 'scraper', 'aggregate'));
var dataGrades = require(path.join(__dirname, '..', 'api', 'scraper', 'grades'));
var friendsGenerate = require(path.join(__dirname, '..', 'api', 'friends', 'generate'));
var friendsShare = require(path.join(__dirname, '..', 'api', 'friends', 'share'));

var router = express.Router();

router.post('/login', function (req, res) {
  let data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  let year = db.choose(parseInt(data.reg_no.slice(0, 2)));
  let app = {
    db: req.dbs[year],
    queue: req.queue
  };
  let onGet = function (err, response) {
    res.json(response);
  };
  loginAuto.get(app, data, onGet);
});

router.post('/refresh', function (req, res) {
  let data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  let year = db.choose(parseInt(data.reg_no.slice(0, 2)));
  let app = {
    db: req.dbs[year],
    queue: req.queue
  };
  let onGet = function (err, response) {
    res.json(response);
  };
  dataAggregate.get(app, data, onGet);
});

router.post('/grades', function (req, res) {
  let data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  let year = db.choose(parseInt(data.reg_no.slice(0, 2)));
  let app = {
    db: req.dbs[year],
    queue: req.queue
  };
  let onGet = function (err, response) {
    res.send(response);
  };
  dataGrades.get(app, data, onGet);
});

router.post('/token', function (req, res) {
  let data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  let year = db.choose(parseInt(data.reg_no.slice(0, 2)));
  let app = {
    db: req.dbs[year],
    queue: req.queue
  };
  let onGet = function (err, response) {
    res.json(response);
  };
  friendsGenerate.get(app, data, onGet);
});

router.post('/share', function (req, res) {
  let token;
  let reg_no;
  let receiver;
  let year;
  if (req.body.token) {
    token = req.body.token.toUpperCase();
    reg_no = cache.get(token);
    if (reg_no) year = db.choose(parseInt(reg_no.slice(0, 2)));
    else year = 0;
  }
  else if (req.body.regno) {
    reg_no = req.body.regno.toUpperCase();
    year = db.choose(parseInt(reg_no.slice(0, 2)));
  }
  if (req.body.receiver === 'VITacademics Developer/Tester') receiver = req.body.receiver;
  else receiver = req.body.receiver.toUpperCase();
  let data = {
    reg_no: reg_no,
    dob: req.body.dob,
    mobile: req.body.mobile,
    token: token,
    receiver: receiver,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  let app = {
    db: req.dbs[year],
    queue: req.queue
  };
  let onGet = function (err, response) {
    res.json(response);
  };
  friendsShare.get(app, data, onGet);
});

module.exports = router;
