'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var lodash = require('lodash');
var utils = require('../../../test/utils');


describe('/api/staffs', function() {
  
  /*
    Authentication
  */
  var token = "";
  it('should login with admin account anhntbk08@gmail.com / anhlavip', function(done) {
    request(app)
      .post('/auth/local')
      .send({
        email: "anhntbk08@gmail.com",
        password: "anhlavip"
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        (res.body.token.length > 0).should.equal(true);
        token = res.body.token;
        done();
      });
  });


  /*
    Test get list staff
  */
  it('should Get List staff ', function(done) {
    request(app)
      .get('/api/staffs')
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.data.should.be.instanceof(Array);
        done();
      });
  });


  /*
    Test create staff
  */
  var staffInfo = {};

  it('should Create a staff ', function(done) {
    var basicInfo = {
      email: utils.generateName(10) + "@gmail.com",
      phoneno:  utils.generateName(10).toString(),
      password: 'anhlavip',
      role: 1,
      type: 'staff',
      name:  utils.generateName(10).toString(),
      address:  utils.generateName(200),
      postcode: utils.generateName(200),
      max_distance: "20",
      available_time: "20",
      title: 'Cave',
      location: utils.generateName(200),
    };
    request(app)
      .post('/api/staffs')
      .send(basicInfo)
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.success.should.be.equal(true);
        staffInfo = res.body.data;
        done();
      });
  });


  /*
    Test update staff
  */
  it('should update a staff ', function(done) {
    (staffInfo.id > 0).should.equal(true);

    var basicInfo = {
      email: utils.generateName(10) + "@gmail.com",
      phoneno:  utils.generateName(10).toString(),
      password: 'anhlavip',
      role: 1,
      type: 'staff',
      name:  utils.generateName(10).toString(),
      address:  utils.generateName(200),
      postcode: utils.generateName(200),
      max_distance: "20",
      available_time: "20",
      title: 'Cave',
      location: utils.generateName(200),
    };
    request(app)
      .put('/api/staffs/updateStaffInfo/' + staffInfo.id)
      .send(basicInfo)
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.success.should.be.equal(true);
        done();
      });
  });


  /*
    Test delete staff
  */
  it('should delete a staff ', function(done) {
    (staffInfo.id > 0).should.equal(true);
    
    request(app)
      .delete('/api/staffs/' + staffInfo.id)
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.success.should.be.equal(true);
        done();
      });
  });

  
});