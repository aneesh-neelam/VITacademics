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

var express = require('express');
var path = require('path');
var router = express.Router();

var system = require(path.join(__dirname, '..', 'api', 'system'));


router.get('/', function (req, res) {
  let app = {
    db: req.db,
    queue: req.queue
  };
  let data = {};
  let onGet = function (err, response) {
    res.json(response);
  };
  system.get(app, data, onGet);
});

module.exports = router;
