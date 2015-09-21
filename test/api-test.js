#!/usr/bin/env node

/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Karthik Balakrishnan <karthikb351@gmail.com>
 *  Copyright (C) 2014-2015  Aneesh Neelam <neelam.aneesh@gmail.com>
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

const path = require('path');
const should = require('chai').should();
const supertest = require('supertest');

const app = require(path.join(__dirname, '..', 'app'));
const status = require(path.join(__dirname, '..', 'status'));
const users = require(path.join(__dirname, '.', 'credentials')).users;

const api = supertest(app);

const onEach = function (user, i, arr) {

  describe('Testing API-v2 for User: ' + user.describe, function () {

    it('Checking if login is successful', function (done) {
      api.post('/api/v2/' + user.campus + '/login')
        .send({regno: user.reg_no, dob: user.dob, mobile: user.mobile})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('reg_no', user.reg_no);
          res.body.should.have.property('dob', user.dob);
          res.body.should.have.property('campus', user.campus);
          res.body.should.have.property('mobile', user.mobile);
          res.body.status.should.deep.equal(status.success);
          done();
        });
    });

    it('Checking if fetching/refreshing current semester details is successful', function (done) {
      api.post('/api/v2/' + user.campus + '/refresh')
        .send({regno: user.reg_no, dob: user.dob, mobile: user.mobile})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('reg_no', user.reg_no);
          res.body.should.have.property('dob', user.dob);
          res.body.should.have.property('campus', user.campus);
          res.body.should.have.property('mobile', user.mobile);
          res.body.should.have.property('semester');
          res.body.should.have.property('courses');
          res.body.should.have.property('cached');
          if (res.body.cached === true) {
            res.body.should.have.property('name')
          }
          res.body.should.have.property('refreshed');
          res.body.should.have.property('withdrawn_courses');
          res.body.status.should.deep.equal(status.success);
          done();
        });
    });

    it('Checking if fetching grades is successful', function (done) {
      api.post('/api/v2/' + user.campus + '/grades')
        .send({regno: user.reg_no, dob: user.dob, mobile: user.mobile})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('reg_no', user.reg_no);
          res.body.should.have.property('dob', user.dob);
          res.body.should.have.property('campus', user.campus);
          res.body.should.have.property('mobile', user.mobile);
          res.body.should.have.property('grades');
          res.body.should.have.property('credits_registered');
          res.body.should.have.property('credits_earned');
          res.body.should.have.property('cgpa');
          res.body.should.have.property('semester_wise');
          res.body.should.have.property('grade_count');
          res.body.should.have.property('cached');
          res.body.cached.should.equal(false);
          res.body.should.have.property('grades_refreshed');
          res.body.status.should.deep.equal(status.success);
          done();
        });
    });

    it('Checking if fetching advisor information is successful', function (done) {
      api.post('/api/v2/' + user.campus + '/advisor')
        .send({regno: user.reg_no, dob: user.dob, mobile: user.mobile})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('reg_no', user.reg_no);
          res.body.should.have.property('dob', user.dob);
          res.body.should.have.property('campus', user.campus);
          res.body.should.have.property('mobile', user.mobile);
          res.body.should.have.property('advisor');
          res.body.should.have.property('cached');
          res.body.status.should.deep.equal(status.success);
          done();
        });
    });

    let token;
    it('Checking if token generation is successful', function (done) {
      api.post('/api/v2/' + user.campus + '/token')
        .send({regno: user.reg_no, dob: user.dob, mobile: user.mobile})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('reg_no', user.reg_no);
          res.body.should.have.property('dob', user.dob);
          res.body.should.have.property('campus', user.campus);
          res.body.should.have.property('mobile', user.mobile);
          res.body.should.have.property('share').with.property('token').with.length(6);
          res.body.status.should.deep.equal(status.success);
          token = res.body.share.token;
          done();
        });
    });

    it('Checking if share using token is successful', function (done) {
      api.post('/api/v2/' + user.campus + '/share')
        .send({token: token, receiver: 'VITacademics Developer/Tester'})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('reg_no', user.reg_no);
          res.body.should.have.property('campus', user.campus);
          res.body.should.have.property('semester');
          res.body.should.have.property('courses');
          res.body.status.should.deep.equal(status.success);
          done();
        });
    });

    it('Checking if share using credentials is successful', function (done) {
      api.post('/api/v2/' + user.campus + '/share')
        .send({regno: user.reg_no, dob: user.dob, mobile: user.mobile, receiver: 'VITacademics Developer/Tester'})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('reg_no', user.reg_no);
          res.body.should.have.property('campus', user.campus);
          res.body.should.have.property('semester');
          res.body.should.have.property('courses');
          res.body.status.should.deep.equal(status.success);
          done();
        });
    });
  });
};

describe('Waiting for Express.js Configuration to complete', function () {
  before(function (done) {
    setTimeout(done, 10000);
  });

  it('Checking if System Endpoint is successful', function (done) {
    api.get('/api/v2/system')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('android');
        res.body.should.have.property('ios');
        res.body.should.have.property('windows');
        res.body.should.have.property('messages');
        res.body.should.have.property('contributors');
        res.body.status.should.deep.equal(status.success);
        done();
      });
  });
  it('Checking Vellore Spotlight Scraper', function(done) {
    api.get('/api/v2/vellore/spotlight')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('spotlight');
        res.body.status.should.deep.equal(status.success);
        done();
      });
  });
  it('Checking Chennai Spotlight Scraper', function(done) {
    api.get('/api/v2/chennai/spotlight')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('spotlight');
        res.body.status.should.deep.equal(status.success);
        done();
      });
  });

  describe('Waiting for Express.js Configuration to complete', function () {
  before(function (done) {
    setTimeout(done, 5000);
  });
  users.forEach(onEach);
});
