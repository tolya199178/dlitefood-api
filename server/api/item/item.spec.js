'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var lodash = require('lodash');
var utils = require('../../../test/utils');


describe('/api/items', function() {
  
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

  */
  it('should Get List items ', function(done) {
    request(app)
      .get('/api/items')
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

  var itemInfo = {};

  it('should Create a item ', function(done) {
    var basicInfo = {
      merchant_id: 58,
      category_id: 7,
      item_meal: 1,
      item_name: utils.generateName(100),
      item_price: utils.generateName(100),
      item_actual_price: utils.generateName(100),
      item_in_stock: utils.generateName(100),
      item_details: utils.generateName(100),
      item_subitem_price: utils.generateName(100),
      item_status: utils.generateName(100)
    };
    request(app)
      .post('/api/items')
      .send(basicInfo)
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.success.should.be.equal(true);
        itemInfo = res.body.data;
        done();
      });
  });

  it('should update a item ', function(done) {
    (itemInfo.item_id > 0).should.equal(true);

    var basicInfo = {
      category_id: 7,
      item_meal: 10,
      item_name: utils.generateName(100),
      item_price: utils.generateName(100),
      item_actual_price: utils.generateName(100),
      item_in_stock: utils.generateName(100),
      item_details: utils.generateName(100),
      item_subitem_price: utils.generateName(100),
      item_status: utils.generateName(100)
    };
    request(app)
      .put('/api/items/' + itemInfo.item_id)
      .send(basicInfo)
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.success.should.equal(true);
        done();
      });
  });

  it('should delete a items ', function(done) {
    (itemInfo.item_id > 0).should.equal(true);
    
    request(app)
      .delete('/api/items/' + itemInfo.item_id)
      .set({
        Authorization: 'Bearer ' + token
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.success.should.equal(true);
        done();
      });
  });

  
});