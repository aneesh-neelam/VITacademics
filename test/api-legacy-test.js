#!/usr/bin/env iojs

/*
 *  VITacademics
 *  Copyright (C) 2014-2015  Ayush Agarwal <agarwalayush161@gmail.com>
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

  describe('Testing API-Legacy for User: ' + user.describe, function () {

    it('Checking if getting captcha image is successful', function (done) {
      api.get('/api/' + user.campus + '/login/manual')
        .query({regno: user.reg_no})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('status').with.deep.equal(status.deprecated);
          done();
        });
    });

    it('Checking if auto-login is successful', function (done) {
      api.get('/api/' + user.campus + '/login/auto')
        .query({regno: user.reg_no, dob: user.dob})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('status').with.deep.equal(status.deprecated);
          done();
        });
    });

    it('Checking if first data fetch is successful', function (done) {
      api.get('/api/' + user.campus + '/data/first')
        .query({regno: user.reg_no, dob: user.dob})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('status').with.deep.equal(status.deprecated);
          done();
        });
    });

    it('Checking if data refresh is successful', function (done) {
      api.get('/api/' + user.campus + '/data/refresh')
        .query({regno: user.reg_no, dob: user.dob})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('status').with.deep.equal(status.deprecated);
          done();
        });
    });

    let token;
    it('Checking if token generation is successful', function (done) {
      api.get('/api/' + user.campus + '/friends/regenerate')
        .query({regno: user.reg_no, dob: user.dob})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('status').with.deep.equal(status.deprecated);
          done();
        });
    });

    it('Checking if share using token is successful', function (done) {
      api.get('/api/' + user.campus + '/friends/share')
        .query({token: token})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('status').with.deep.equal(status.deprecated);
          done();
        });
    });

    it('Checking if share using credentials is successful', function (done) {
      api.get('/api/' + user.campus + '/friends/share')
        .query({regno: user.reg_no, dob: user.dob})
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('status').with.deep.equal(status.deprecated);
          done();
        });
    });
  });
};

describe('Waiting for Express.js Configuration to complete', function () {
  before(function (done) {
    setTimeout(done, 10000);
  });
  users.forEach(onEach);
});
