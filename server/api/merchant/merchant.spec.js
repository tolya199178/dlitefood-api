'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var lodash = require('lodash');
var utils = require('../../../test/utils');


describe('/api/merchants', function() {
  
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

  it('should Get List merchant ', function(done) {
    request(app)
      .get('/api/merchants')
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

  var merchantInfo = {};

  it('should Create a merchant ', function(done) {
    var basicInfo = {
      email: utils.generateName(10) + "@gmail.com",
      phoneno:  utils.generateName(20).toString(),
      password: 'anhlavip',
      name:  utils.generateName(10).toString(),
      picture: utils.generateName(100),
      steps: utils.generateName(100),
      time: utils.generateName(100),
      notes: utils.generateName(100),
      charges: utils.generateName(100),
      min_order: utils.generateName(100),
      opening_hours: utils.generateName(100),
      category: utils.generateName(100),
      is_delivery: utils.generateName(100),
      special_offer: utils.generateName(100)
    };
    request(app)
      .post('/api/merchants')
      .send(basicInfo)
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.success.should.be.equal(true);
        merchantInfo = res.body.data;
        done();
      });
  });

  it('should update a merchant ', function(done) {
    (merchantInfo.id > 0).should.equal(true);

    var basicInfo = {
      email: utils.generateName(30) + "@gmail.com",
      phoneno:  utils.generateName(20).toString(),
      password: 'anhlavip',
      name:  utils.generateName(10).toString(),
      picture: utils.generateName(100),
      steps: utils.generateName(100),
      time: utils.generateName(100),
      notes: utils.generateName(100),
      charges: utils.generateName(100),
      min_order: utils.generateName(100),
      opening_hours: utils.generateName(100),
      category: utils.generateName(100),
      is_delivery: utils.generateName(100),
      special_offer: utils.generateName(100)
    };
    request(app)
      .put('/api/merchants/' + merchantInfo.id)
      .send(basicInfo)
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        console.log(res.body);
        res.body.success.should.equal(true);
        done();
      });
  });

  it('should delete a merchant ', function(done) {
    (merchantInfo.id > 0).should.equal(true);
    
   
    request(app)
      .delete('/api/merchants/' + merchantInfo.id)
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