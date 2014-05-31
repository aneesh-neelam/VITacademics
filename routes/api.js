var config = require('../config');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res) {
    res.send('API Documentation');
});

router.get('/login/manual', function (req, res) {
    var RegNo = req.query.regno;
    var DoB = req.query.dob;
    var campus = req.query.campus;
    var doc = {"RegNo": RegNo, "DoB": DoB};
    res.send('Fetch Captcha from VIT Academics ' + campus + ' Campus for RegNo: ' + RegNo + ' and DoB: ' + DoB);
    if (campus === "vellore") {
        velloreLogin(doc, function (callback) {
            callback();
        });
    }
    else if (campus === "chennai") {
        chennaiLogin(doc, function (callback) {
            callback();
        });
    }
});

router.get('/login/auto', function (req, res) {
    var RegNo = req.query.regno;
    var DoB = req.query.dob;
    var campus = req.query.campus;
    var doc = {"RegNo": RegNo, "DoB": DoB};
    res.send('Fetch Captcha from VIT Academics' + campus + 'Campus for RegNo: ' + RegNo + ' and DoB: ' + DoB);
    if (campus === "vellore") {
        velloreLogin(doc, function (callback) {
            callback();
        });
    }
    else if (campus === "chennai") {
        chennaiLogin(doc, function (callback) {
            callback();
        });
    }
    res.send('Captchaless login!');
});

module.exports = router;

function velloreLogin(doc, callback) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(config.MongoLab, function (err, db) {
        if (err) throw err;
        console.log("MongoDB Connection Closed");
        var collection = db.collection('vellore_student');
        collection.insert(doc, function (err, docs) {
            callback(function () {
                db.close();
                console.log("MongoDB Connection Closed");
            });
        });

    });
}

function chennaiLogin(doc, callback) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(config.MongoLab, function (err, db) {
        if (err) throw err;
        console.log("MongoDB Connection Closed");
        var collection = db.collection('chennai_student');
        collection.insert(doc, function (err, docs) {
            callback(function () {
                db.close();
                console.log("MongoDB Connection Closed");
            });
        });

    });
}