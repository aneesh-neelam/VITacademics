var express = require('express');
var router = express.Router();

router.get('/csrf_test', function(req, res){
    var msg = req.session.color || "color_undefined";
    res.render('csrf_test', {title: 'form_test', message: msg, csrfToken: req.csrfToken()});
});

router.post('/csrf_test', function(req, res){
    req.session.color = req.body.color;
    res.redirect('/tests/csrf_test');
});

module.exports = router;
