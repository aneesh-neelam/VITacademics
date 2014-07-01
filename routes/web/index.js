var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res)
{
    res.render('index', { title: 'Express' });
});

router.get('/status', function (req, res)
{
    var engine = "Heroku";
    var serverStatus = 'OK';
    var lastUpdated = '1st July 2014';
    res.render('status', {engine: engine, serverStatus: serverStatus, lastUpdated: lastUpdated});
});

router.get('/api', function (req, res)
{
    res.send('API Documentation');
});

module.exports = router;