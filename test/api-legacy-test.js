/*
 *  VITacademics
 *  Copyright (C) 2015  Ayush Agarwal <agarwalayush161@gmail.com>
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

var path = require('path');
var should = require('chai').should();
var supertest = require('supertest');

var app = require(path.join(__dirname, '..', 'app'));
var codes = require(path.join(__dirname, '..', 'api-legacy', 'status')).codes;
var users = require(path.join(__dirname, '.', 'credentials')).users;
var captcha = require(path.join(__dirname, '..', 'api-legacy', 'login', 'captcha-parser'));

var api = supertest(app);

for (var i = 0; i < users.length; i++) {
    var user = users[i];
    describe('Testing User: ' + user.describe, function () {
        it('Checking if Captcha image is returned successfully', function (done) {
            api.get('/api/' + user.campus + '/login/manual')
                .query({'regno': user.reg_no})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    var parsedCaptcha = captcha.parseBuffer(res.body);
                    parsedCaptcha.should.have.length(6);
                    done();
                });
        });

        it('Checking if auto-login is successful', function (done) {
            api.get('/api/' + user.campus + '/login/auto')
                .query({'regno': user.reg_no, 'dob': user.dob})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('reg_no', user.regno);
                    res.body.should.have.property('dob', user.dob);
                    res.body.should.have.property('campus', user.campus);
                    res.body.should.have.property('status').with.deep.equal(codes.success);
                    done();
                });
        });

        it('Checking if first data fetch is successful', function (done) {
            api.get('/api/' + user.campus + '/data/first')
                .query({'regno': user.reg_no, 'dob': user.dob})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('reg_no', user.regno);
                    res.body.should.have.property('dob', user.dob);
                    res.body.should.have.property('campus', user.campus);
                    res.body.should.have.property('status').with.deep.equal(codes.success);
                    res.body.should.have.property('share').with.property('token').with.length(6);
                    done();
                });
        });

        it('Checking if data refresh is successful', function (done) {
            api.get('/api/' + user.campus + '/data/refresh')
                .query({'regno': user.reg_no, 'dob': user.dob})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('reg_no', user.regno);
                    res.body.should.have.property('dob', user.dob);
                    res.body.should.have.property('campus', user.campus);
                    res.body.should.have.property('status').with.deep.equal(codes.success);
                    done();
                });
        });

        it('Checking if token generation is successful', function (done) {
            api.get('/api/' + user.campus + '/friends/regenerate')
                .query({'regno': user.reg_no, 'dob': user.dob})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('reg_no', user.regno);
                    res.body.should.have.property('dob', user.dob);
                    res.body.should.have.property('campus', user.campus);
                    res.body.should.have.property('status').with.deep.equal(codes.success);
                    res.body.should.have.property('share').with.property('token').with.length(6);
                    done();
                });
        });

        it('Checking if sharing of timetable is successful', function (done) {
            api.get('/api/' + user.campus + '/friends/share')
                .query({'regno': user.reg_no, 'dob': user.dob})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('reg_no', user.regno);
                    res.body.should.have.property('campus', user.campus);
                    res.body.should.have.property('status').with.deep.equal(codes.success);
                    done();
                });
        });
    });
}
