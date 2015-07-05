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

var express = require('express');
var path = require('path');

var status = require(path.join(__dirname, '..', 'status'));

var router = express.Router();

router.get('/login/manual', function (req, res) {
  let data = {
    status: status.deprecated
  };
  res.json(data);
});

router.get('/login/submit', function (req, res) {
  let data = {
    status: status.deprecated
  };
  res.json(data);
});

router.get('/login/auto', function (req, res) {
  let data = {
    status: status.deprecated
  };
  res.json(data);
});

router.get('/data/first', function (req, res) {
  let data = {
    status: status.deprecated
  };
  res.json(data);
});

router.get('/data/refresh', function (req, res) {
  let data = {
    status: status.deprecated
  };
  res.json(data);
});

router.get('/friends/regenerate', function (req, res) {
  let data = {
    status: status.deprecated
  };
  res.json(data);
});

router.get('/friends/share', function (req, res) {
  let data = {
    status: status.deprecated
  };
  res.json(data);
});

module.exports = router;
