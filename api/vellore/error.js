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
    Success: {Message: 'Successful Execution', Code: 0},
    TimedOut: {Message: 'Session timed out', Code: 1},
    Invalid: {Message: 'Invalid Credentials or Captcha', Code: 2},
    Down: {Message: 'VIT\'s servers may be down or we may be facing a connectivity issue', Code: 3},
    MongoDown: {Message: 'Our MongoDB may be down or we may be facing a connectivity issue', Code: 4},
    CaptchaParsing: {Message: 'Error parsing Captcha', Code: 5},
    ToDo: {Message: 'This feature is incomplete', Code: 7},
    Outage: {Message: 'Our backend servers may be down or you may be facing a connectivity issue', Code: 8},
    Other: {Message: 'An unforeseen error has occurred', Code: 9}
};

module.exports.codes = error;