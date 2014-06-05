var mongo = require('./mongo');
var errors = require('./error');
var unirest = require('unirest');
var cookie = require('cookie');
var cache = require('memory-cache');
var cheerio = require('cheerio');

exports.getCaptcha = function (RegNo, callback)
{
    var uri = 'https://academics.vit.ac.in/parent/captcha.asp';
    unirest.get(uri)
        .encoding(null)
        .set('Content-Type', 'image/bmp')
        .end(function (response)
             {
                 var myCookie = [];
                 var regEx = new RegExp("ASPSESSION");
                 Object.keys(response.cookies).forEach(function (key)
                                                       {
                                                           if (regEx.test(key))
                                                           {
                                                               myCookie[0] = key;
                                                               myCookie[1] = response.cookies[key];
                                                           }
                                                       });
                 cache.put(RegNo, myCookie, 180000);
                 callback(response.body);
             });
};

exports.submitLogin = function (RegNo, DoB, Captcha, callback)
{
    var CookieJar = unirest.jar();
    if (cache.get(RegNo) !== null)
    {
        var myCookie = cache.get(RegNo);
        var cookieSerial = cookie.serialize(myCookie[0], myCookie[1]);
        var uri = 'https://academics.vit.ac.in/parent/parent_login_submit.asp';
        CookieJar.add(unirest.cookie(cookieSerial), uri);
        unirest.post(uri)
            .jar(CookieJar)
            .followRedirect(true)
            .form({
                      'wdregno': RegNo,
                      'wdpswd': DoB,
                      'vrfcd': Captcha
                  }).end(function (response)
                         {
                             var login = false;
                             var scraper = cheerio.load(response.body);
                             scraper("table").each(function (i, elem)
                                                   {
                                                       if (new RegExp(RegNo).test(scraper(this).text()))
                                                       {
                                                           login = true;
                                                           return false;
                                                       }
                                                   });
                             if (login)
                             {
                                 var doc = {"RegNo": RegNo, "DoB": DoB};
                                 mongo.insert(doc, function (mongoCallback)
                                 {
                                     mongoCallback();
                                 });
                                 callback(errors.errorCodes['Success']);
                             }
                             else callback(errors.errorCodes['Invalid']);
                         });
    }
    else callback(errors.errorCodes['TimedOut']);
};