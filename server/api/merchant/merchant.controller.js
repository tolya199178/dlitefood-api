'use strict';

var models          = require('../../models'),
    passport        = require('passport' ),
    config          = require('../../config/environment' ),
    _               = require('lodash' ),
    utils           = require('../../components/utils'),
    merchantSocket  = require('./merchant.socket');


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

var ROLES = {
  ADMIN: 1,
  SUPERVISOR: 2,
  STAFF: 3,
  MERCHANT: 4,
  CUSTOMER: 5
}

var MERCHANT_STATUS = {
  ACTIVE: "1",
  INACTIVE: "2"
};

// Get list of merchants
exports.index = function(req, res) {
  try {
    models.Merchants.findAll({
      include: [{model: models.Users, attributes: ['email', 'phoneno']}]
    } ).then( function (merchants) {
      return res.envelope(merchants);
    } ).catch( function (exception) {

      return res.error(305, exception.toString());
    });

  } catch (exception) {
    handlerException(res, exception);
  }

};


/**
 * Creates a new merchant
 * @param {email}
 * @param {phoneno}
 * @param {password}
 * @param {name}
 * @param {picture}
 * @param {steps}
 * @param {time}
 * @param {notes}
 * @param {charges}
 * @param {min_order}
 * @param {opening_hours}
 * @param {category}
 * @param {is_delivery}
 * @param {special_offer}
 * @result {Object} {success: true/false, id: 'in success case'}
 */

exports.create = function (req, res, next) {
  var newMerchant = req.body;
  newMerchant.provider = 'local';
  newMerchant.status = 1;
  if (!newMerchant.email ||
      !newMerchant.phoneno ||
      !newMerchant.password ||
      !newMerchant.name ||
      !newMerchant.picture ||
      !newMerchant.time ||
      !newMerchant.notes ||
      !newMerchant.charges ||
      !newMerchant.min_order ||
      !newMerchant.opening_hours ||
      !newMerchant.category ||
      !newMerchant.is_delivery ||
      !newMerchant.special_offer
      ){
    return res.json(400, {success: false, msg: 'Please ensure to pass the required parameters to api!'});
  }

  // Must create user-account first
  models.Users.createUser({
    email: newMerchant.email,
    phoneno: newMerchant.phoneno,
    password: newMerchant.password,
    name: newMerchant.name,
    role: ROLES.MERCHANT,
    type: 'merchant'
  }, function(result){

    // can't create user
    if (!result.success){
      return res.json(400, result);
    }

    newMerchant.user_id = result.user.id;

    // create merchant with user info
    models.Merchants.create(newMerchant).then(function(merchant){
      if (!merchant) res.json(400, {success: false, msg: 'Unknow issue !!'});

      res.json(200, {success: true, data: merchant});
    })
    .catch(function(exception){
      handlerException (res, exception);
    });

  });

};


/**
 * Update a merchant information
 * restriction: 'admin'
 * @param {email}
 * @param {phoneno}
 * @param {password}
 * @param {name}
 * @param {picture}
 * @param {steps}
 * @param {time}
 * @param {notes}
 * @param {charges}
 * @param {min_order}
 * @param {opening_hours}
 * @param {category}
 * @param {is_delivery}
 * @param {special_offer}
 * @result {Object} {success: true/false}
 * @description
 *  There a two kind of information we need update,
 *    - first for user info: email, phoneno, password
      - second
 *  Staff information.
 */
exports.update = function(req, res) {
  if (!req.params.id){
    return res.json(400, {success: false, msg: 'You must pass in merchant !'});
  }

  models.Merchants.findOne({
    where: {
      id: req.params.id
    },
    include: [{model: models.Users}]
  }).then(function(merchant){
    if (!merchant) return res.json(404,{success: false, data: 'Can\'t find the merchant ' });
    // merchant = _.merge(merchant, req.body);

    // update merchant info
    models.Merchants
      .update(req.body, {
        where: {
          id: merchant.id
        }
      })
      .then(function(result){
        if (!result)  return res.json(500,{success: false, data: 'Can\'t update the merchant info' });

        // update user info
        var user = {
          password: req.body.password,
          email: req.body.email,
          phoneno: req.body.phoneno,
          id: merchant.User.id
        };
        models.Users.updateUser(user, function(data){
          if (!data.success){
            return res.json(500, data);
          }else{
            return res.json(200, {success: true});
          }

        });
      });

  })
  .catch(function(exception){
    handlerException (res, exception);
  });

};

/**
 * Deletes a merchant
 * restriction: 'admin'
 * @param {INT} merchantId in params.id
 * @result {Object} {success: true/false}
 */
exports.destroy = function(req, res) {
  if (!req.params.id){
    return res.json(400, {success: false, msg: 'You must pass in merchant !'});
  }

  models.Merchants.findOne({
    where: {
      id: req.params.id
    },
    include: [{model: models.Users}]
  }).then(function(merchant){
    if (!merchant) return res.json(404,{success: false, data: 'Can\'t find the merchant ' });

    // delete linked user, we use cascade on User vs Staff
    // so when we delete user, the merchant will be delete too

    models.Users.destroy({
      where: {
        id: merchant.User.id
      }
    })
    .then(function(result){
      if(result != 1) return res.json(404,{success: false, data: 'Can\'t delete the user ' });
      res.json(200, {success: true});
    })
    .catch(function(exception){
      handlerException (res, exception);
    });

  })
  .catch(function(exception){
    handlerException (res, exception);
  });

};

var ITEM_STATUS = {
  ACTIVE: "1",
  INACTIVE: "2"
}

/*
  Get Merchant item categories
  @param {INTERGER} merchantId
*/

exports.getCategories = function(req, res){
  if (!req.params.id){
    return res.json(400, {success: false, msg: 'You must pass in merchant !'});
  }

  var query = 'select distinct * from (select c.category_id,  c.category_name, c.category_detail from categories as c, items as i, merchants as m where m.id = '+ req.params.id +' and i.merchant_id = m.id and i.category_id = c.category_id ) as t';
  models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT})
    .then(function(categories){
      if (!categories) return res.json(404,{success: false, data: 'Can\'t find the categories ' });

      return res.json(200, {success: true, data: categories});
    })
    .catch(function(exception){
      handlerException (res, exception);
    });

}

/*
  Get Single Merchant information
 @param {INTEGER} merchantId
*/

exports.single = function(req, res){
  if (!req.params.id){
    return res.json(400, {success: false, msg: 'You must pass in merchant !'});
  }

  models.Merchants
    .findOne({
      where: {
        id: req.params.id
      },
      include: [{
        model: models.Items,
        where: {
          item_status: ITEM_STATUS.ACTIVE
        },
        attributes: ['item_id', 'item_name', 'item_price', 'item_in_stock', 'item_details'],
        include: [{
          model: models.Categories,
          attributes: ['category_id', 'category_name']
        }]
      },{
        model: models. Merchant_Groups
      }]
    })
    .then(function(merchant){
      if (!merchant) return res.json(404,{success: false, data: 'Can\'t find the merchant ' });

      return res.json(200, {success: true, data: merchant});
    })
    .catch(function(exception){
      handlerException (res, exception);
    });

}

function handlerException (res, ex){
  res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}
