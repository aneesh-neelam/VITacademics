var mongo = require('./mongo');
var errors = require('./error');
var unirest = require('unirest');
var cookie = require('cookie');
var cache = require('memory-cache');
var cheerio = require('cheerio');

exports.getCaptcha = function (RegNo, callback)
{
    var uri = 'https://academics.vit.ac.in/parent/captcha.asp';
    var onRequest = function (response)
    {
        var myCookie = [];
        var regEx = new RegExp("ASPSESSION");
        var onEach = function (key)
        {
            if (regEx.test(key))
            {
                myCookie[0] = key;
                myCookie[1] = response.cookies[key];
            }
        };
        Object.keys(response.cookies).forEach(onEach);
        cache.put(RegNo, myCookie, 180000);
        callback(response.body);
    };
    unirest.get(uri)
        .encoding(null)
        .set('Content-Type', 'image/bmp')
        .end(onRequest);
};

exports.submitLogin = function (RegNo, DoB, Captcha, callback)
{
    if (cache.get(RegNo) !== null)
    {
        var CookieJar = unirest.jar();
        var myCookie = cache.get(RegNo);
        var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
        var uri = 'https://academics.vit.ac.in/parent/parent_login_submit.asp';
        CookieJar.add(unirest.cookie(cookieSerial), uri);
        var onPost = function (response)
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
            scraper("table").each(onEach);
            if (login)
            {
                var doc = {"RegNo": RegNo, "DoB": DoB};
                var onInsert = function ()
                {
                };
                mongo.insert(doc, onInsert);
                callback(errors.codes['Success']);
            }
            else callback(errors.codes['Invalid']);
        };
        unirest.post(uri)
            .jar(CookieJar)
            .followRedirect(true)
            .form({
                      'wdregno': RegNo,
                      'wdpswd': DoB,
                      'vrfcd': Captcha
                          })
            .end(onPost);
    }
    else callback(errors.codes['TimedOut']);
};