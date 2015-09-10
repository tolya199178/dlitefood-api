'use strict';

var models = require('../../models'),
    passport = require('passport'),
    config = require('../../config/environment'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash');

var validationError = function(res, err) {
  return res.json(422, err);
};

var LIST_ROLE_ATTRIBUTE = [
        'id',
        'name'
      ];

/**
 * Get list of role in the system
 */
exports.index = function(req, res) {

  try {
    models.Roles.findAll({}).then(function (roles) {
      res.json(200, {success: true, data: roles});
    })
    .catch(function(exception){
      res.json(500, {success: false, data: exception, msg: 'Exception thrown !!!'});
    });;
  } catch (exception){
    res.json(500, {success: false, data: exception, msg: 'Exception thrown !!!'});
  }
};
