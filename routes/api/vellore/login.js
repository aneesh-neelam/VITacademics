var api_login = require('../../../api/vellore/login');
var express = require('express');
var router = express.Router();

router.get('/manual', function (req, res)
{
    var RegNo = req.query.regno;
    var onGetCaptcha = function (captchaImage)
    {
        res.writeHead(200, {"Content-Type": "image/bmp"});
        res.write(captchaImage);
        res.end();
    };
    api_login.getCaptcha(RegNo, onGetCaptcha);
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
    var Captcha = req.query.captcha;
    var onSubmit = function (loginResponse)
    {
        res.send(loginResponse);
    };
    api_login.submitLogin(RegNo, DoB, Captcha, onSubmit);
});

module.exports = router;