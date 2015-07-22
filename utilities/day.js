/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Aneesh Neelam <neelam.aneesh@gmail.com>
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

const getCodeFromText = function (text) {
  let code;
  text = text.toUpperCase();
  switch (text) {
    case 'MON':
      code = 0;
      break;
    case 'TUE':
      code = 1;
      break;
    case 'WED':
      code = 2;
      break;
    case 'THU':
      code = 3;
      break;
    case 'FRI':
      code = 4;
      break;
    case 'SAT':
      code = 5;
      break;
    default:
      code = -1;
      break;
  }
  return code;
};

module.exports.getCodeFromText = getCodeFromText;
