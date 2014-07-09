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

app.use(logger('dev'));

app.set('title', 'VITacademics');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var cookieSecret = process.env.COOKIE_SECRET || 'randomsecretstring';
app.use(cookieParser(cookieSecret, {signed: true}));

app.use('/', routes);
app.use('/api/vellore', api_vellore);
app.use('/api/vellore/login', api_vellore_login);
app.use('/api/vellore/data', api_vellore_data);
app.use('/api/chennai', api_chennai);
app.use('/api/chennai/login', api_chennai_login);
app.use('/api/chennai/data', api_chennai_data);

// catch 404 and forward to error handler
app.use(function (req, res, next)
        {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

// error handlers
// development error handler, will print stacktrace
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

// production error handler, no stacktraces leaked to user
app.use(function (err, req, res, next)
        {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });

module.exports = app;