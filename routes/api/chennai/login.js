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

var express = require('express');
var unirest = require('unirest');
var cache = require('memory-cache');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/VITacademics';

router.get('/manual', function (req, res)
{
    var RegNo = req.query.regno;
    var uri = 'Chennai URL';
    unirest.get(uri)
        .encoding(null)
        .set('Content-Type', 'image/bmp')
        .end(function (response)
             {
                 var doc = {"RegNo": RegNo, "DoB": DoB, "Cookie": response.cookies};
                 login(doc, function (callback)
                 {
                     callback();
                 });
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

module.exports = router;

function login(doc, callback)
{
    MongoClient.connect(mongoUri, function (err, db)
    {
        if (err) throw err;
        var collection = db.collection('chennai_student');
        collection.update({"RegNo": doc.RegNo}, doc, {upsert: true}, function (err, docs)
        {
            callback(function ()
                     {
                         db.close();
                     });
        });
    });
}