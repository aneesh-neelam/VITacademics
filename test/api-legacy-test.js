/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2015  Karthik Balakrishnan <karthikb351@gmail.com>
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

var api = supertest(app);

for (var i = 0; i < users.length; i++) {
    var user = users[i];
    describe('Testing User: ' + user.describe, function () {
        it('Checking if Captcha image is returned successfully', function (done) {
            api.post('/api/' + user.campus + '/login/manual')
                .send({'regno': user.reg_no})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    //TODO - check property if image received
                    done();
                });
        });

        it('Checking if manual-login through API is successful', function (done) {
            api.post('/api/' + user.campus + '/login/manual')
                .send({'regno': user.reg_no, 'dob': user.dob, 'captcha':/*TODO - captcha*/})
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

        it('Checking if auto-login is successful', function (done) {
            api.post('/api/' + user.campus + '/login/auto')
                .send({'regno': user.reg_no, 'dob': user.dob})
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
            api.post('/api/' + user.campus + '/data/first')
                .send({'regno': user.reg_no, 'dob': user.dob})
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
            api.post('/api/' + user.campus + '/data/refresh')
                .send({'regno': user.reg_no, 'dob': user.dob})
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
            api.post('/api/' + user.campus + '/friends/regenerate')
                .send({'regno': user.reg_no, 'dob': user.dob})
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
            api.post('/api/' + user.campus + '/friends/share')
                .send({'regno': user.reg_no, 'dob': user.dob})
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
    });
}
