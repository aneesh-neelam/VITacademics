/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014-2015  Karthik Balakrishnan <karthikb351@gmail.com>
 *
 *  This file is part of VITacademics.
 *
 *  VITacademics is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  VITacademics is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with VITacademics.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const keys = {
  '0': [
    ['0', '0', '0', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '1', '1', '0'],
    ['1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '0', '0', '0', '1', '1', '0', '1', '1'],
    ['1', '1', '0', '0', '1', '1', '0', '0', '1', '1'],
    ['1', '1', '0', '1', '1', '0', '0', '0', '1', '1'],
    ['1', '1', '1', '1', '0', '0', '0', '0', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1'],
    ['0', '1', '1', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '0', '0', '0']
  ],
  '1': [
    ['0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1']
  ],
  '2': [
    ['0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['1', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '0', '0', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '1', '1', '1', '1', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1']
  ],
  '3': [
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0']
  ],
  '4': [
    ['0', '0', '0', '0', '0', '0', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '0', '0', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '0', '0', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '0', '0']
  ],
  '5': [
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0']
  ],
  '6': [
    ['0', '0', '0', '0', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '1', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '0', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '1', '1', '1', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '0', '0', '0']
  ],
  '7': [
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '0', '0', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['0', '0', '0', '0', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '0', '0', '0', '0']
  ],
  '8': [
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '0', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '1'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0']
  ],
  '9': [
    ['0', '0', '0', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '1', '1', '1', '1', '1', '1', '0', '1', '1', '1'],
    ['0', '0', '1', '1', '1', '1', '1', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '0', '0', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '0', '0', '0', '0']
  ],
  'A': [
    ['0', '0', '0', '0', '1', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '1', '0', '0', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1']
  ],
  'B': [
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0']
  ],
  'C': [
    ['0', '0', '0', '0', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '1', '1', '1', '1', '0', '0', '0', '0', '1', '1'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '1'],
    ['0', '1', '1', '1', '1', '0', '0', '0', '0', '1', '1'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '1', '1', '1', '1', '1', '1', '0']
  ],
  'D': [
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0', '0']
  ],
  'E': [
    ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1']
  ],
  'F': [
    ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0']
  ],
  'G': [
    ['0', '0', '0', '0', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '1', '1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '1', '1', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '1', '1', '1', '1', '1', '1', '1', '0', '0']
  ],
  'H': [
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1']
  ],
  'I': [
    ['1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1']
  ],
  'J': [
    ['0', '0', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '1', '1', '0', '0']
  ],
  'K': [
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1']
  ],
  'L': [
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1']
  ],
  'M': [
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '0', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '1', '1', '0', '1', '1', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '1', '1', '1', '1', '1', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '1', '1', '1', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '1', '1', '1', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1']
  ],
  'N': [
    ['1', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1']
  ],
  'O': [
    ['0', '0', '0', '0', '1', '1', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '1', '1', '0', '0', '0', '0']
  ],
  'P': [
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0']
  ],
  'Q': [
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '1', '1'],
    ['1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1'],
    ['1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1'],
    ['1', '1', '0', '0', '0', '0', '0', '1', '0', '0', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '0', '1', '1'],
    ['0', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '1', '0']
  ],
  'R': [
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['1', '1', '1', '0', '0', '1', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '1', '1', '1', '0', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1']
  ],
  'S': [
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '0', '0', '0', '0', '1', '1', '0'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '0'],
    ['1', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '0', '0', '0']
  ],
  'T': [
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0']
  ],
  'U': [
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '1'],
    ['0', '1', '1', '1', '1', '1', '1', '1', '1', '1', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '0', '0', '0']
  ],
  'V': [
    ['1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '1', '0', '0', '0', '0']
  ],
  'W': [
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '1', '0', '0', '0', '1', '1', '1'],
    ['0', '1', '1', '1', '0', '0', '1', '1', '0', '1', '1', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '0', '1', '1', '0', '1', '1', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '1', '1', '0', '0', '0', '1', '1', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '0', '1', '1', '0', '0', '0', '1', '1', '0', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '0', '0', '0', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1', '1', '0', '0']
  ],
  'X': [
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['0', '1', '1', '1', '1', '0', '0', '1', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '1', '1', '1', '1', '0', '0', '1', '1', '1', '1', '0'],
    ['1', '1', '1', '1', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '0', '1', '1', '1']
  ],
  'Y': [
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['1', '1', '1', '0', '0', '0', '0', '0', '1', '1', '1'],
    ['0', '1', '1', '1', '0', '0', '0', '1', '1', '1', '0'],
    ['0', '1', '1', '1', '1', '0', '1', '1', '1', '1', '0'],
    ['0', '0', '1', '1', '1', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '1', '1', '1', '1', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '0']
  ],
  'Z': [
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '0', '1', '1', '1', '1'],
    ['0', '0', '0', '0', '0', '1', '1', '1', '1', '0'],
    ['0', '0', '0', '0', '0', '1', '1', '1', '0', '0'],
    ['0', '0', '0', '0', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '1', '0', '0', '0'],
    ['0', '0', '0', '1', '1', '1', '0', '0', '0', '0'],
    ['0', '0', '1', '1', '1', '0', '0', '0', '0', '0'],
    ['0', '1', '1', '1', '1', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '0', '0', '0', '0', '0', '0'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1'],
    ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1']
  ]
};

const order = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
];

module.exports.keyMask = keys;
module.exports.keyOrder = order;
