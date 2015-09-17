'use strict';

var models          = require('../../models'),
    passport        = require('passport' ),
    config          = require('../../config/environment' ),
    _               = require('lodash' );

var ITEM_STATUS = {
  ACTIVE: "1",
  INACTIVE: "2"
}

// Get list of item
exports.index = function(req, res) {

  try {
    models.Items.findAll({
      include: [
        {
          model: models.Merchants,
          attributes: ['id', 'name']
        },
        {
          model: models.Categories,
          attributes: ['category_name', 'category_detail']
        }
      ]
    } ).then( function (items) {
      return res.envelope(items);
    } ).catch( function (exception) {

      return res.json(500, {success: false, data: exception.toString(), msg: 'Exception thrown. Please review request'});
    });

  } catch (exception) {
    handlerException(res, exception);
  }

};



/**
 * Creates a new item merchant
 * @param {merchant_id}
 * @param {category_id}
 * @param {item_meal}
 * @param {item_name}
 * @param {item_price}
 * @param {item_actual_price}
 * @param {item_in_stock}
 * @param {item_details}
 * @param {item_subitem_price}
 * @param {item_status}
 * @result {Object} {success: true/false, id: 'in success case'}
 */

exports.create = function (req, res, next) {
  var newMerchantItem = req.body;
  newMerchantItem.item_status = newMerchantItem.item_status || ITEM_STATUS.ACTIVE;

  /*
    check mandatory fields
  */
  if (!newMerchantItem.merchant_id ||
      !newMerchantItem.category_id ||
      !newMerchantItem.item_meal ||
      !newMerchantItem.item_name ||
      !newMerchantItem.item_price ||
      !newMerchantItem.item_actual_price ||
      !newMerchantItem.item_in_stock ||
      !newMerchantItem.item_details ||
      !newMerchantItem.item_subitem_price
      ){
    return res.json(400, {success: false, msg: 'You must pass in mandatory fields !'});
  }


  // create merchant
  models.Items.create(newMerchantItem).then(function(item){
    if (!item) res.json(400, {success: false, msg: 'Unknown issue !!'});

    res.json(200, {success: true, data: item});
  })
  .catch(function(exception){
    handlerException (res, exception);
  });

};




/**
 * update a new item merchant
 * @param {merchant_id}
 * @param {category_id}
 * @param {item_meal}
 * @param {item_name}
 * @param {item_price}
 * @param {item_actual_price}
 * @param {item_in_stock}
 * @param {item_details}
 * @param {item_subitem_price}
 * @param {item_status}
 * @result {Object} {success: true/false, id: 'in success case'}
 */
exports.update = function(req, res) {
  if (!req.params.id){
    return res.json(400, {success: false, msg: 'You must pass in user !'});
  }

  models.Items.findOne({
    where: {
      item_id: req.params.id
    }
  }).then(function(item){
    if (!item) return res.json(404,{success: false, data: 'Can\'t find the item ' });

    // update item info
    models.Items
      .update(req.body, {
        where: {
          item_id: item.item_id
        }
      })
      .then(function(result){
        if (!result)  return res.json(500,{success: false, data: 'Can\'t update the merchant info' });

        return res.json(200, {success: true});
      });

  })
  .catch(function(exception){
    handlerException (res, exception);
  });
};

// Deletes a item from the DB.
exports.destroy = function(req, res) {
  if (!req.params.id){
    return res.json(400, {success: false, msg: 'You must pass in user !'});
  }

  models.Items.findOne({
    where: {
      item_id: req.params.id
    }
  }).then(function(item){
    if (!item) return res.json(404,{success: false, data: 'Can\'t find the item ' });

    models.Items.destroy({
      where: {
        item_id: item.item_id
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


function handlerException (res, ex){
  res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}
