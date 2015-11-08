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

const system = require(path.join(__dirname, '..', 'api', 'system'));

const router = express.Router();

router.get('/', function (req, res) {
  const app = {
    db: req.dbs[5]
  };
  const data = {};
  const onGet = function (err, response) {
    res.json(response);
  };
  system.get(app, data, onGet);
});

module.exports = router;
