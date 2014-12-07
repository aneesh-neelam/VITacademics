/*
 *  VITacademics
 *  Copyright (C) 2014  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014  Ayush Agarwal <agarwalayush161@gmail.com>
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

var error = {
    success: {message: 'Successful execution', code: 0},
    timedOut: {message: 'Session timed out', code: 11},
    invalid: {message: 'Invalid credentials or captcha', code: 12},
    captchaParsing: {message: 'Error parsing captcha', code: 13},
    tokenExpired: {message: 'Token expired', code: 14},
    noData: {message: 'Requested data is not available', code: 15},
    toDo: {message: 'This feature is incomplete', code: 50},
    vitDown: {message: 'VIT\'s servers may be down or we may be facing a connectivity issue', code: 89},
    mongoDown: {message: 'Our MongoDB instance may be down or we may be facing a connectivity issue', code: 97},
    outage: {message: 'Our backend servers may be down or you may be facing a connectivity issue', code: 98},
    other: {message: 'An unforeseen error has occurred', code: 99}
};

module.exports.codes = error;
