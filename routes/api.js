/*
 *  VITacademics
 *  Copyright (C) 2014-2016  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014-2016  Ayush Agarwal <agarwalayush161@gmail.com>
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

const cache = require('memory-cache');
const express = require('express');
const path = require('path');

const loginAuto = require(path.join(__dirname, '..', 'api', 'login', 'auto'));
const dataAggregate = require(path.join(__dirname, '..', 'api', 'scraper', 'aggregate'));
const dataGrades = require(path.join(__dirname, '..', 'api', 'scraper', 'grades'));
const friendsGenerate = require(path.join(__dirname, '..', 'api', 'friends', 'generate'));
const friendsShare = require(path.join(__dirname, '..', 'api', 'friends', 'share'));
const facultyAdvisor = require(path.join(__dirname, '..', 'api', 'scraper', 'advisor'));
const registerGCM = require(path.join(__dirname, '..', 'api', 'register'));
const spotlight = require(path.join(__dirname, '..', 'api', 'scraper', 'spotlight'));
const facultyInfo = require(path.join(__dirname, '..', 'api', 'faculty-info'));

const router = express.Router();

router.post('/login', function (req, res) {
  const data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile || null,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  const app = {
    db: req.db
  };
  const onGet = function (err, response) {
    res.json(response);
  };
  loginAuto.get(app, data, onGet);
});

router.post('/refresh', function (req, res) {
  const data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile || null,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  const app = {
    db: req.db
  };
  const onGet = function (err, response) {
    res.json(response);
  };
  dataAggregate.get(app, data, onGet);
});

router.post('/grades', function (req, res) {
  const data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile || null,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  const app = {
    db: req.db
  };
  const onGet = function (err, response) {
    res.send(response);
  };
  dataGrades.get(app, data, onGet);
});

router.post('/token', function (req, res) {
  const data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile || null,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  const app = {
    db: req.db
  };
  const onGet = function (err, response) {
    res.json(response);
  };
  friendsGenerate.get(app, data, onGet);
});

router.post('/share', function (req, res) {
  let token;
  let reg_no;
  let receiver;
  if (req.body.token) {
    token = req.body.token.toUpperCase();
    reg_no = cache.get(token);
  }
  else if (req.body.regno) {
    reg_no = req.body.regno.toUpperCase();
  }
  if (req.body.receiver === 'VITacademics Developer/Tester') receiver = req.body.receiver;
  else receiver = req.body.receiver.toUpperCase();
  const data = {
    reg_no: reg_no,
    dob: req.body.dob,
    mobile: req.body.mobile || null,
    token: token,
    receiver: receiver,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  const app = {
    db: req.db
  };
  const onGet = function (err, response) {
    res.json(response);
  };
  friendsShare.get(app, data, onGet);
});

router.post('/advisor', function (req, res) {
  const data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile || null,
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  const app = {
    db: req.db
  };
  const onGet = function (err, response) {
    res.json(response);
  };
  facultyAdvisor.get(app, data, onGet);
});

router.post('/register', function (req, res) {
  const data = {
    reg_no: req.body.regno.toUpperCase(),
    dob: req.body.dob,
    mobile: req.body.mobile || null,
    campus: req.originalUrl.split('/')[3].toLowerCase(),
    type: req.body.type.toLowercase(),
    id: req.body.id
  };
  const app = {
    db: req.db
  };
  const onRegister = function (err, response) {
    res.json(response);
  };
  registerGCM.register(app, data, onRegister);
});

router.get('/spotlight', function (req, res) {
  const data = {
    campus: req.originalUrl.split('/')[3].toLowerCase()
  };
  const app = {
    db: req.db
  };
  const onGet = function (err, response) {
    res.json(response);
  };
  spotlight.get(app, data, onGet);
});

router.post('/faculty', function (req, res) {
  const data = {
    name: req.body.name.toUpperCase()
  };
  const app = {
    db: req.db
  };
  const onGet = function (err, response) {
    res.json(response);
  };
  facultyInfo.get(app, data, onGet);
});

module.exports = router;
