'use strict';

var models = require('../../models'),
    passport = require('passport'),
    config = require('../../config/environment'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash'),
    userSocket = require('./user.socket');

var validationError = function(res, err) {
  return res.json(422, err);
};

var LIST_STAFF_ATTRIBUTE = [
    'name',
    'address',
    'postcode',
    'max_distance',
    'available_time',
    'location'
  ];

var LIST_MERCHANT_ATTRIBUTE = [
    'name', 
    'picture',
    'time',
    'notes', 
    'charges',
    'steps',
    'min_order',
    'opening_hours',
    'category',
    'is_delivery',
    'special_offer',
    'status',
    'food'
  ];

var LIST_CUSTOMER_ATTRIBUTE = [
    'name',
    'screen_name',
    'address',
    'address1',
    'city',
    'post_code',
    'dob',
    'verified',
    'status',
    'co_user',
    'co_company_name',
    'co_job_title',
    'co_total_employees',
    'co_pay_method'
  ];



/**
 * Change a users password
 * Change current login user password
 * @param {String} oldPassword
 * @param {String} newPassword
 * @result {Object} {success: true/false }
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user.id;
  var oldPass = req.body.oldPassword;
  var newPass = req.body.newPassword;

  if (!oldPass || !newPass || newPass.length < 7){
    return res.json(400, {success: false, msg: 'You must pass in valid passwords and new password must be at least 7 character length !'});
  }

  try{
    models.Users
    .findOne({
      where: {
        id: userId
      }
    })
    .then(function (user) {
      if(!user) return res.json(404,{success: false, data: 'Can\'t find the user ' });

      // if oldPass in correct
      if(user.authenticate(oldPass)) {
        user.update({
            password: newPass
          },{
            where: {
              id: userId
            }
        })

        /*
          Success case
        */
        .then(function(result) {
          if (!result) return res.json(404,{success: false, data: 'Unknown issue - can\'t update password !' });
          return res.json(200, {success: true});
        })

        /*
          Failed case
        */
        .catch(function(exception){
          res.json(500, {success: false, data: exception.toString(), msg: 'Exception thrown !!!'});
        });

      } else {
        return res.json(403, {success: false, msg: 'Forbidden'});
      }
    });
  }
  catch (exception){
    res.json(500, {success: false, data: exception, msg: 'Exception thrown !!!'});
  }
  
};




/**
 * Get personal info
 * {result} personal info of current login user
 */
var USER_TYPES = {
  STAFF: 'staff',
  MERCHANT: 'merchant',
  CUSTOMER: 'customer',
}
exports.me = function(req, res, next) {
  var userId = req.user.id;
  var detailModel = {};
  var attributes = [];

  /*
    Get Proper model base on user's type
    there are three types:
      1. staff - Staffs table
      2. merchant - Merchants tables
      3. customer - Customers table
  */
  switch (req.user.type){
    case USER_TYPES.STAFF:
      detailModel = models.Staffs;
      attributes = LIST_STAFF_ATTRIBUTE;
      break;

    case USER_TYPES.MERCHANT:
      detailModel = models.Merchants;
      attributes = LIST_MERCHANT_ATTRIBUTE;
      break;

    case USER_TYPES.CUSTOMER:
      detailModel = models.Customers;
      attributes = LIST_CUSTOMER_ATTRIBUTE;
      break;
  };

  /*
    Get User detail
  */
  try{

    detailModel.findOne({
      where: {
        user_id: userId
      }
    }).then(function(info) {
      if (!info) return res.json(401, {success: false, msg: 'Can\'t find the your info !'});

      // get email/phoneno info from user
      var result = _.pick(info, LIST_STAFF_ATTRIBUTE);
      result.email = req.user.email;
      result.phoneno = req.user.phoneno;
      result.id = req.user.id;

      res.json(200, {success: true, data: result});
    })
    .catch(function(exception){
      res.json(500, {success: false, data: exception, msg: 'Exception thrown !!!'});
    });
  }
  catch (exception){
    res.json(500, {success: false, data: exception, msg: 'Exception thrown !!!'});
  }
  
};

