var mongo = require('./mongo');
var errors = require('./error');
var unirest = require('unirest');
var cookie = require('cookie');
var cache = require('memory-cache');
var cheerio = require('cheerio');
var debug = require('debug')('VITacademics');

exports.getCaptcha = function (RegNo, callback)
{
    var uri = 'https://academics.vit.ac.in/parent/captcha.asp';
    var onRequest = function (response)
    {
        if (response.error)
        {
            debug('VIT Academics connection failed');
            callback(true, errors.codes.Down);
        }
        else
        {
            var myCookie = [];
            var onEach = function (key)
            {
                var regEx = new RegExp('ASPSESSION');
                if (regEx.test(key))
                {
                    myCookie[0] = key;
                    myCookie[1] = response.cookies[key];
                }
            };
            Object.keys(response.cookies).forEach(onEach);
            cache.put(RegNo, myCookie, 180000);
            callback(null, response.body);
        }
    };
    unirest.get(uri)
        .encoding(null)
        .set('Content-Type', 'image/bmp')
        .end(onRequest);
};

exports.submitLogin = function (RegNo, DoB, Captcha, callback)
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
                var onEach = function (i, elem)
                {
                    if (new RegExp(RegNo).test(scraper(this).text()))
                    {
                        login = true;
                        return false;
                    }
                };
                var login = false;
                var scraper = cheerio.load(response.body);
                scraper('table').each(onEach);
                if (login)
                {
                    var doc = {"RegNo": RegNo, "DoB": DoB};
                    var onInsert = function (err)
                    {
                        if (err)
                        {
                            debug('MongoDB connection failed');
                            callback(true, errors.codes.MongoDown);
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