/*
 *  VITacademics
 *  Copyright (C) 2014-2016  Aneesh Neelam <neelam.aneesh@gmail.com>
 *
 *  This file is part of VITacademics.
 *
 *  VITacademics is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  VITacademics is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with VITacademics.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const config = {
  port: process.env.PORT || 3000,
  mongoDb: process.env.MONGODB_URI || 'mongodb://localhost/VITacademics',
  amqp_Uri: process.env.AMQP_URI || 'amqp://localhost',
  logentriesEnabled: process.env.LOGENTRIES_TOKEN ? true : false,
  logentriesToken: process.env.LOGENTRIES_TOKEN || 'Unavailable',
  newRelicEnabled: process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENSE_KEY && process.env.NEW_RELIC_NO_CONFIG_FILE ? true : false,
  newRelicAppName: process.env.NEW_RELIC_APP_NAME || 'Unavailable',
  newRelicLicense: process.env.NEW_RELIC_LICENSE_KEY || 'Unavailable',
  expressLogLevel: process.env.EXPRESS_LOGGER_LEVEL || 'dev',
  expressSecretKey: process.env.EXPRESS_SECRET_KEY || 'randomsecretstring',
  googleAnalyticsToken: process.env.GOOGLE_ANALYTICS_TOKEN || 'UA-35429946-2',
  txtWebAppKey: process.env.TXTWEB_APP_KEY || 'randomkey',
  chennaiSemesterCode: process.env.CHENNAI_SEMESTER_CODE || 'WS15',
  velloreSemesterCode: process.env.VELLORE_SEMESTER_CODE || 'WS'
};

module.exports = config;
