var config = require('../../../config');
var errors = require('../error');
var express = require('express');
var unirest = require('unirest');
var cookie = require('cookie');
var cache = require('memory-cache');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

var CookieKey = 'ASPSESSIONIDSUDTCDSD';

router.get('/manual', function (req, res)
{
    var RegNo = req.query.regno;
    var uri = 'https://academics.vit.ac.in/parent/captcha.asp';
    unirest.get(uri)
        .encoding(null)
        .set('Content-Type', 'image/bmp')
        .end(function (response)
             {
                 cache.put(RegNo, response.cookies[CookieKey], 180000);
                 res.writeHead(200, {"Content-Type": "image/bmp"});
                 res.write(response.body);
                 res.end();
             });
});

router.get('/auto', function (req, res)
{
    var RegNo = req.query.regno;
    var DoB = req.query.dob;
    /*
     login(doc, function (callback) {
     callback();
     });
     */
    res.send('Captchaless login!');
});

router.get('/submit', function (req, res)
{
    var RegNo = req.query.regno;
    var DoB = req.query.dob;
    var captcha = req.query.captcha;
    var CookieJar = unirest.jar();
    if (cache.get(RegNo) !== null)
    {
        var CookieVal = cache.get(RegNo);
        var CookieSerial = cookie.serialize(CookieKey, CookieVal);
        var uri = 'https://academics.vit.ac.in/parent/parent_login_submit.asp';
        CookieJar.add(unirest.cookie(CookieSerial), uri);
        unirest.post(uri)
            .jar(CookieJar)
            .followRedirect(true)
            .form({
                      'wdregno': RegNo,
                      'wdpswd': DoB,
                      'vrfcd': captcha
                  }).end(function (response)
                         {
                             var newDoc = {"RegNo": RegNo, "DoB": DoB};
                             insert(newDoc, function (callback)
                             {
                                 callback();
                             });
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
                             if (login) res.send(errors.errorCodes['Success']);
                             else res.send(errors.errorCodes['Invalid']);
                         });
    }
    else res.send(errors.errorCodes['TimedOut']);
});

module.exports = router;

function insert(doc, callback)
{
    MongoClient.connect(config.MongoDB, function (err, db)
    {
        if (err) throw err;
        var collection = db.collection('vellore_student');
        collection.update({"RegNo": doc.RegNo}, doc, {upsert: true}, function (error, docs)
        {
            callback(function ()
                     {
                         db.close();
                     });
        });
    });
}

function fetch(doc, callback)
{
    MongoClient.connect(config.MongoDB, function (err, db)
    {
        if (err) throw err;
        var collection = db.collection('vellore_student');
        var cursor = collection.find({"RegNo": doc.RegNo});
        cursor.toArray(function (error, docs)
                       {
                           callback(docs[0], function ()
                           {
                               db.close();
                           });
                       });
    });
}