var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

var routes = require('./routes/web/index');

var api_vellore = require('./routes/api/vellore/index.js');
var api_vellore_login = require('./routes/api/vellore/login.js');
var api_vellore_data = require('./routes/api/vellore/data.js');

var api_chennai = require('./routes/api/chennai/index.js');
var api_chennai_login = require('./routes/api/chennai/login.js');
var api_chennai_data = require('./routes/api/chennai/data.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
                                  extended: true
                              }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);

app.use('/api/vellore', api_vellore);
app.use('/api/vellore/login', api_vellore_login);
app.use('/api/vellore/data', api_vellore_data);

app.use('/api/chennai', api_chennai);
app.use('/api/chennai/login', api_chennai_login);
app.use('/api/chennai/data', api_chennai_data);


/// catch 404 and forward to error handler
app.use(function (req, res, next)
        {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development')
{
    app.use(function (err, req, res, next)
            {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next)
        {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });

module.exports = app;