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

var cache = require('memory-cache');
var cheerio = require('cheerio');
var cookie = require('cookie');
var path = require('path');
var unirest = require('unirest');

var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var errors = require(path.join(__dirname, '..', '..', 'error'));
var mongo = require(path.join(__dirname, '..', 'db', 'mongo'));


exports.submitCaptcha = function (RegNo, DoB, Captcha, callback)
{
    var data = {RegNo: RegNo};
    if (cache.get(RegNo) !== null)
    {
        var CookieJar = unirest.jar();
        var myCookie = cache.get(RegNo);
        var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
        var submitUri = 'http://27.251.102.132/parent/parent_login_submit.asp';
        CookieJar.add(unirest.cookie(cookieSerial), submitUri);
        var onPost = function (response)
        {
            if (response.error)
            {
                data.Error = errors.codes.Down;
                if (log)
                {
                    log.log('debug', data);
                }
                console.log('VIT Academics connection failed');
                callback(true, data);
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
                                if (log)
                                {
                                    log.log('debug', {
                                        RegNo: RegNo,
                                        Error: errors.codes.MongoDown
                                    });
                                }
                                console.log('MongoDB connection failed');
                            }
                        };
                        mongo.update(doc, ['DoB'], onInsert);
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
        unirest.post(submitUri)
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
