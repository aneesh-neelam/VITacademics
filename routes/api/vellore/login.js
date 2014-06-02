var config = require('../../../config');
var express = require('express');
var unirest = require('unirest');
var cookie = require('cookie');
var cache = require('memory-cache');
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
                 cache.put(RegNo, response.cookies[CookieKey]);
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
    var CookieVal = cache.get(RegNo);
    var CookieSerial = cookie.serialize(CookieKey, CookieVal);
    var uri = 'https://academics.vit.ac.in/parent/parent_login_submit.asp';
    CookieJar.add(unirest.cookie(CookieSerial), uri);
    unirest.post(uri)
        .jar(CookieJar)
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
                         /*
                          Must determine login status
                          Respond with appropriate status code
                          */
                         console.log(response.headers);
                         res.writeHead(200, {"Content-Type": "text/html"});
                         res.write(response.body);
                         res.end();
                     });
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