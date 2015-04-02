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

module.exports = {
  success: {message: 'Successful Execution', code: 0},
  timedOut: {message: 'Session Timed Out', code: 11},
  invalid: {message: 'Invalid Credentials or Error Parsing the Data', code: 12},
  captchaParsing: {message: 'Error Parsing Captcha', code: 13},
  tokenExpired: {message: 'Token Expired', code: 14},
  noData: {message: 'Requested Data is not Available', code: 15},
  toDo: {message: 'This Feature is Incomplete', code: 50},
  vitDown: {message: 'VIT\'s Servers may be Slow/Down or We may be facing a Connectivity Issue', code: 89},
  mongoDown: {message: 'Our MongoDB Instance may be Down or We may be facing a Connectivity Issue', code: 97},
  maintenance: {
    message: 'Our backend servers are Down for Maintenance, please contact the VITacademics Developers for more Information',
    code: 98
  },
  other: {message: 'An Unforeseen/Unknown/Irrecoverable Error has Occurred', code: 99}
};
