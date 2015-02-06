#!/usr/bin/env node

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

var assert = require('assert');
var path = require('path');

// TODO tests
console.log('Hello!');

var router = require('../routes/web.js')

describe('routes.js  ', function(){
	describe('Module router ', function(){
		it('should have a get method', function(){
			assert.equal(typeof router, 'function')
			assert.equal(typeof router.get, 'function');
		})
	})
});