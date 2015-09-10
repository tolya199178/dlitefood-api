'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var lodash = require('lodash');

describe('GET /api/users', function() {
  
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

  it('should not login with admin account anhntbk08@gmail.com / anhlavip', function(done) {
    request(app)
      .post('/auth/local')
      .send({
        email: "anhntbk08@gmail.com",
        password: "anhlavip!@#$%^&*(QAZ VBNM<$%^&*("
      })
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        done();
      });
  });

  it('should get personal info with Authorization header', function(done) {
    (token.length > 0).should.equal(true);

    request(app)
      .get('/api/users/me')
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should not get personal info without correct Authorization header', function(done) {
    request(app)
      .get('/api/users/me')
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});