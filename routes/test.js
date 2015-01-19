/*
 *  VITacademics
 *  Copyright (C) 2015  Sreeram Boyapati <sreeram.boyapati2011@gmail.com>
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
var router = express.Router();


router.get('/csrf_test', function (req, res) {
    var msg = req.session.color || "color_undefined";
    res.render('csrf_test', {title: 'form_test', message: msg, csrfToken: req.csrfToken()});
});

router.post('/csrf_test', function (req, res) {
    req.session.color = req.body.color;
    res.redirect('/tests/csrf_test');
});

module.exports = router;
