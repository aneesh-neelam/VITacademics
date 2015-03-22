/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
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

router.get('/', function (req, res) {
    var googleAnalyticsToken = process.env.GOOGLE_ANALYTICS_TOKEN || 'UA-35429946-2';
    res.render('index', {googleAnalyticsToken: googleAnalyticsToken});
});

module.exports=function(router){
  router.get('/status', function (req, res) {
      var port = process.env.PORT || 3000;
      var googleAnalyticsToken = process.env.GOOGLE_ANALYTICS_TOKEN || 'UA-35429946-2';
      var status = {
          host: process.env.HOST || 'localhost',
          hostname: process.env.HOSTNAME || 'http://localhost:' + port + '/',
          engine: process.version,
          platform: process.platform,
          arch: process.arch,
          serverStatus: 'OK',
          lastUpdated: '18th March 2015',
          googleAnalyticsToken: googleAnalyticsToken
      };
      res.render('status', status);
  });

  router.get('/api', function (req, res) {
      res.redirect('https://github.com/aneesh-neelam/VITacademics/wiki');
  });
}
