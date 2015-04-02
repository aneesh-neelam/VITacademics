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

var handler = function (app) {
  var onJob = function (job, ack) {
    console.log('(Feature Incomplete) ' + job);
    ack();
  };
  app.queue.handle(app.queue.queues.share, onJob);
};

module.exports = handler;
