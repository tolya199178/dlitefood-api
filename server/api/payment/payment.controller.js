'use strict';


var models          = require('../../models'),
  passport        = require('passport' ),
  config          = require('../../config/environment' ),
  _               = require('lodash' ),
  utils           = require('../../components/utils'),
  crypto          = require('crypto'),
  paypal          = require('paypal-rest-sdk');

exports.create = function(req, res) {
  paypal.configure(config.paypal);
  var create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:9001/api/payment/confirm",
      "cancel_url": "http://localhost:9001/api/payment/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "item",
          "sku": "item",
          "price": "1.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "1.00"
      },
      "description": "This is the payment description."
    }]
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      res.json(payment);
    }
  });
};

function handlerException (res, ex){
  res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}
