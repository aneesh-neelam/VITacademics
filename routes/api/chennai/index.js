var express = require('express');
var cache = require('memory-cache');
var router = express.Router();

router.get('/', function (req, res)
{
    res.send('Chennai Login API Documentation');
    console.log(cache.get("11BCE0260"));
});

module.exports = router;