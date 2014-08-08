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

var error = {
    Success: {Message: 'Successful execution', Code: 0},
    TimedOut: {Message: 'Session timed out', Code: 11},
    Invalid: {Message: 'Invalid credentials or captcha', Code: 12},
    CaptchaParsing: {Message: 'Error parsing captcha', Code: 13},
    Expired: {Message: 'Token expired', Code: 14},
    NoData: {Message: 'Requested data is not available', Code: 15},
    ToDo: {Message: 'This feature is incomplete', Code: 50},
    Down: {Message: 'VIT\'s servers may be down or we may be facing a connectivity issue', Code: 89},
    MongoDown: {Message: 'Our MongoDB instance may be down or we may be facing a connectivity issue', Code: 97},
    Outage: {Message: 'Our backend servers may be down or you may be facing a connectivity issue', Code: 98},
    Other: {Message: 'An unforeseen error has occurred', Code: 99}
};

module.exports.codes = error;