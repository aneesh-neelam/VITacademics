/*
 *  VITacademics - Worker
 *  Copyright (C) 2015  Ayush Agarwal <agarwalayush161@gmail.com>
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

var jackrabbit = require ('jackrabbit');
var mongoClient = require ('mongodb');
var path = require ('path');
var underscore = require ('underscore');

var handleMain = require(path.join(__dirname, 'handlers', 'main'));
var handleMobile = require(path.join(__dirname, 'handlers', 'mobile'));
var handleShare = require(path.join(__dirname, 'handlers', 'share'));

var amqpURI = process.env.AMQP_URI || 'amqp://localhost';
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/VITacademics';

var app = {
    db: null,
    queue: null
};

var onConnect = function (err, db) {
    app.db = db;
};
mongoClient.connect(mongoURI, onConnect);

var queue = jackrabbit(amqpURI);
queue.queues = {
  main: 'VITacademics',
  mobile: 'mobile',
  share: 'share'
};
queue.on('connected', function () {
  app.queue = queue;
  var forEachQueue = function (elt, i, arr) {
      var onReady = function () {
        switch (elt) {
          case queue.queues.main:
            handleMain(app);
            break;
          case queue.queues.mobile:
            handleMobile(app);
            break;
          case queue.queues.share:
            handleShare(app);
            break;
          default:
            console.log('Unsupported Queue. ');
            break;
        }
      };
      queue.create(elt, {prefetch: 500}, onReady);
  };
  underscore.values(queue.queues).forEach(forEachQueue);
});
