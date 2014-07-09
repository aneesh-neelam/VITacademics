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

var mongo = require('../db/mongo');
var errors = require('../error');
var cache = require('memory-cache');
var cheerio = require('cheerio');
var cookie = require('cookie');
var debug = require('debug')('VITacademics');
var unirest = require('unirest');

exports.submitCaptcha = function (RegNo, DoB, Captcha, callback)
{
    var data = {RegNo: RegNo};
    if (cache.get(RegNo) !== null)
    {
        var CookieJar = unirest.jar();
        var myCookie = cache.get(RegNo);
        var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
        var uri = 'https://academics.vit.ac.in/parent/parent_login_submit.asp';
        CookieJar.add(unirest.cookie(cookieSerial), uri);
        var onPost = function (response)
        {
            if (response.error)
            {
                debug('VIT Academics connection failed');
                callback(true, errors.codes.Down);
            }
            else
            {
                var login = false;
                try
                {
                    var scraper = cheerio.load(response.body);
                    scraper = cheerio.load(scraper('table').eq(1).html());
                    var onEach = function (i, elem)
                    {
                        if (new RegExp(RegNo).test(scraper(this).text()))
                        {
                            login = true;
                            return false;
                        }
                    };
                    scraper('font').each(onEach);
                }
                catch (ex)
                {
                    login = false;
                    // Scraping Login failed
                }
                finally
                {
                    if (login)
                    {
                        var doc = {"RegNo": RegNo, "DoB": DoB};
                        var onInsert = function (err)
                        {
                            if (err)
                            {
                                debug('MongoDB connection failed');
                                // callback(true, errors.codes.MongoDown);
                                // Asynchronous, may or may not be reachable, need a better solution
                            }
                        };
                        mongo.update(doc, 'DoB', onInsert);
                        data.Error = errors.codes.Success;
                        callback(null, data);
                    }
                    else
                    {
                        data.Error = errors.codes.Invalid;
                        callback(null, data);
                    }
                }
            }
        };
        unirest.post(uri)
            .jar(CookieJar)
            .form({
                      'wdregno': RegNo,
                      'wdpswd': DoB,
                      'vrfcd': Captcha
                  })
            .end(onPost);
    }
    else
    {
        data.Error = errors.codes.TimedOut;
        callback(null, data);
    }
};