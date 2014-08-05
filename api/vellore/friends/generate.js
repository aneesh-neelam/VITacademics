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

var cache = require('memory-cache');
var path = require('path');
var underscore = require('underscore');

var resource = require(path.join(__dirname, 'resource'));


var generate = function (RegNo, validity, callback)
{
    var token;
    do
    {
        token = underscore.sample(resource.resources, 6).join('');
    }
    while (cache.get(token));
    cache.put(token, RegNo, validity * 60 * 60 * 1000);
    callback(null, token);
};

exports.getToken = function (RegNo, callback)
{
    var validity = 18; // In Hours
    var onGeneration = function (err, token)
    {
        var data = {
            Token: token,
            Validity: validity,
            Issued: new Date().toUTCString()
        };
        callback(err, data)
    };
    generate(RegNo, validity, onGeneration);
};