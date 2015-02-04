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

var cache = require('memory-cache');
var path = require('path');
var underscore = require('underscore');

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

var status = require(path.join(__dirname, '..', 'status'));
var resource = require(path.join(__dirname, '..', 'token-resource'));


var generate = function (regNo, validity, callback) {
    var token;
    do
    {
        token = underscore.sample(resource.resources, 6).join('');
    }
    while (cache.get(token));
    cache.put(token, regNo, validity * 60 * 60 * 1000);
    callback(null, token);
};

exports.get = function (app, data, callback) {
    var collection = app.db.collection('student');
    var onFetch = function (err, doc) {
        if (err) {
            data.status = status.codes.mongoDown;
            if (log) {
                log.log('debug', data);
            }
            callback(true, data);
        }
        if (doc) {
            var validity = 24; // In Hours
            var onGeneration = function (err, token) {
                data.share = {
                    token: token,
                    validity: validity,
                    issued: new Date().toJSON()
                };
                data.status = status.codes.success;
                callback(err, data);
            };
            generate(data.reg_no, validity, onGeneration);
        }
        else {
            data.status = status.codes.invalid;
            callback(false, data);
        }
    };
    collection.findOne({reg_no: data.reg_no, dob: data.dob, campus: data.campus}, onFetch);
};
