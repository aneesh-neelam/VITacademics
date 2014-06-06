var api_data = require('../../../api/vellore/scraper');
var express = require('express');
var router = express.Router();

router.get('/refresh', function (req, res)
{
    var RegNo = req.query.regno;
    var onGetData = function (data)
    {
        res.send(data);
    };
    api_data.getData(RegNo, false, onGetData)
});

router.get('/first', function (req, res)
{
    var RegNo = req.query.regno;
    var onGetData = function (data)
    {
        res.send(data);
    };
    api_data.getData(RegNo, true, onGetData)
});

module.exports = router;