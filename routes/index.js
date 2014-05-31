var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

router.get('/status', function (req, res) {
    var engine = "Node.js " + process.version + " using the Express framework";
    var serverStatus = 'OK';
    var lastUpdated = '31st May 2014';
    res.render('status', {engine: engine, serverStatus: serverStatus, lastUpdated: lastUpdated});
});

module.exports = router;
