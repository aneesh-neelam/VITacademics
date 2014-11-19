/*
 *  VITacademics
 *  Copyright (C) 2014  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014  Karthik Balakrishnan <karthikb351@gmail.com>
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

var path = require('path');

var captchaResource = require(path.join(__dirname, 'captcha-resource'));


var parseBuffer = function (bitmapBuffer) {
    var pixelMap = getPixelMapFromBuffer(bitmapBuffer);
    return getCaptcha(pixelMap);
};

var getPixelMapFromBuffer = function (bitmapBuffer) {
    var pixelMap = [];
    var subArray = [];
    var row = 0;
    for (var i = bitmapBuffer.length - (25 * 132), r = 0; i < bitmapBuffer.length; ++i, ++r) {
        if (Math.floor(r / 132) !== row) {
            row = Math.floor(r / 132);
            pixelMap.push(subArray);
            subArray = [];
        }
        subArray.push(bitmapBuffer.readUInt8(i));
    }
    pixelMap.push(subArray);
    pixelMap.reverse();
    return pixelMap;
};

var getCaptcha = function (img) {
    var order = captchaResource.keyOrder;
    var keys = captchaResource.keyMask;

    function matchImg(rx, ry, pix, mask) {
        var flag = 1;
        var breakflag = 0;
        var count = 0;
        for (var x = 0; x < mask.length; ++x) {
            for (var y = 0; y < mask[0].length; ++y) {
                try {
                    if (mask[x][y] == '1') {
                        if (pix[rx + x][ry + y] == '1') {
                            count += 1;
                        }
                        else {
                            flag = 0;
                            breakflag = 1;
                            break;
                        }
                    }
                }
                catch (e) {
                    flag = 0;
                    breakflag = 1;
                    break;
                }
            }
            if (breakflag) {
                break;
            }
        }
        if (count === 0) {
            flag = 0;
        }
        return flag;
    }

    var skip = function (start, end, y) {
        var flag = 0;
        for (var i = 0; i < start.length; ++i) {
            if (y >= start[i] && y <= end[i]) {
                flag = 1;
                break;
            }
        }
        return flag;
    };

    var sort = function (sorter, captcha) {
        for (var i = 0; i < sorter.length; ++i) {
            var less = sorter[i];
            var swap = 0;
            var ls = i;
            for (var k = i; k < sorter.length; k++) {
                if (sorter[k] < less) {
                    less = sorter[k];
                    ls = k;
                    swap = 1;
                }
            }
            if (swap) {
                var temps = sorter[i];
                sorter[i] = sorter[ls];
                sorter[ls] = temps;
                var tempc = captcha[i];
                captcha[i] = captcha[ls];
                captcha[ls] = tempc;
            }
        }
    };

    var temp = 0;
    var x, y;
    for (x = 0; x < 25; ++x) {
        for (y = 0; y < 132; ++y) {
            temp = img[x][y];
            if (x !== 0 && x !== 24) {
                if (img[x + 1][y] === 0 && temp === 1 && img[x - 1][y] === 0) {
                    img[x][y] = 0;
                }
            }

        }
    }
    var yoff = 2;
    var xoff = 2;
    var skipstart = [];
    var skipend = [];
    var sorter = [];
    var captcha = [];
    for (var l = 0; l < 36; ++l) {
        var mask = keys[order[l]];
        var f = 0;
        for (x = xoff; x < 25; ++x) {
            for (y = yoff; y < 132; ++y) {
                if (skip(skipstart, skipend, y)) {
                    continue;
                }
                else {
                    if (matchImg(x, y, img, mask)) {
                        skipstart.push(y);
                        skipend.push(y + mask[0].length);
                        sorter.push(y);
                        captcha.push(order[l]);
                        f = f + 1;
                    }
                }
            }
        }
        if (f == 6) {
            break;
        }
    }
    sort(sorter, captcha);
    var res = "";
    for (var i = 0; i < captcha.length; ++i) {
        res = res + captcha[i];
    }
    return res;
};

module.exports.parseBuffer = parseBuffer;
