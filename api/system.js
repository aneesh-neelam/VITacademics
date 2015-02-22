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

var async = require('async');
var path = require('path');

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

var status = require(path.join(__dirname, 'status'));


exports.get = function (app, data, callback) {
    var clientCollection = app.db.collection('client');
    var messageCollection = app.db.collection('message');
    var parallelTasks = {
        client: function (asyncCallback) {
            var keys = {
                android: 1,
                ios: 1,
                windows: 1
            };
            clientCollection.findOne({}, keys, asyncCallback);
        },
        message: function (asyncCallback) {
            messageCollection.find({}, {limit: 10, sort: ['_id', ['desc']}).toArray(asyncCallback);
        }
    };
    var onFetch = function (err, results) {
        if (err) {
            data.status = status.codes.mongoDown;
            if (log) {
                log.log('debug', data);
            }
            console.log(data.status);
            callback(true, data);
        }
        else if (results.client && results.messages) {
            data.android = results.client.android;
            data.ios = results.client.ios;
            data.windows = results.client.windows;
            data.messages = results.messages;
            data.status = status.codes.success;
            callback(false, data);
        }
        else {
            data.status = status.codes.noData;
            if (log) {
                log.log('debug', data);
            }
            console.log(data.status);
            callback(true, data);
        }
    };
    async.parallel(parallelTasks, onFetch);
};
