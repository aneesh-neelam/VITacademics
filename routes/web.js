/*
 *  VITacademics
 *  Copyright (C) 2014-2016  Aneesh Neelam <neelam.aneesh@gmail.com>
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

const router = express.Router();

router.get('/', function (req, res) {
  res.render('index', {googleAnalyticsToken: config.googleAnalyticsToken});
});

router.get('/web', function (req, res) {
  res.send(status.toDo.message);
});

router.get('/api', function (req, res) {
  res.redirect('https://github.com/aneesh-neelam/VITacademics/wiki');
});

module.exports = router;
