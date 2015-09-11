'use strict';

var models          = require('../../models'),
    passport        = require('passport' ),
    config          = require('../../config/environment' ),
    _               = require('lodash' ),
    utils       = require('../../components/utils');

// Get list of merchant_groups

exports.index = function(req, res) {
  models.Merchant_Groups
    .findAll({})
    .then(function (merchant_groups, error) {
      if (!merchant_groups) utils.handlerServerException(res, error);

      return utils.handleSuccess(res, merchant_groups);
    })
    .catch(function(ex){
      return utils.handlerSequelizeException(res, ex);
    });;
};


/*
  Update the name/charges for merchant_group
  @param {charges} the levels price that customer must charge depend on order price
  @param {name} name of merchant_group
*/

exports.update = function(req, res) {
  if (!req.params.id){
    return utils.handlerUserInputException(res, {});
  }

  models.Merchant_Groups
    .update(req.body,{
        where: {
          id: req.params.id
        }
    })
    .then(function (result, error) {
      if (!result) utils.handlerServerException(res, error || {});

      return utils.handleSuccess(res, {});
    })
    .catch(function(ex){
      return utils.handlerSequelizeException(res, ex);
    });;
};
