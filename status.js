/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
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

var status = {
  success: {
    message: 'Successful execution',
    code: 0
  },
  timedOut: {
    message: 'Session timed out',
    code: 11
  },
  invalid: {
    message: 'Invalid credentials',
    code: 12
  },
  captchaParsing: {
    message: 'Error parsing captcha',
    code: 13
  },
  tokenExpired: {
    message: 'Token expired',
    code: 14
  },
  noData: {
    message: 'Requested data is not available',
    code: 15
  },
  dataParsing: {
    message: 'Error parsing data or invalid credentials',
    code: 16
  },
  toDo: {
    message: 'This feature is incomplete, please help us by contributing to its development',
    code: 50
  },
  deprecated: {
    message: 'This feature or endpoint has been deprecated, please bear with us while we upgrade your app',
    code: 60
  },
  vitDown: {
    message: 'VIT\'s Servers may be slow/down or we may be facing a connectivity Issue',
    code: 89
  },
  mongoDown: {
    message: 'Our MongoDB instances may be Down or We may be facing a connectivity Issue',
    code: 97
  },
  maintenance: {
    message: 'Our API servers are down for maintenance, please bear with us while we do what we do best',
    code: 98
  },
  other: {
    message: 'An unforeseen/unknown/irrecoverable error has occurred, please bear with us while we fix it',
    code: 99
  }
};

module.exports = status;
