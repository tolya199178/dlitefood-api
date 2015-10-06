'use strict';


var models        = require('../../models'),
  passport        = require('passport' ),
  config          = require('../../config/environment' ),
  _               = require('lodash' ),
  utils           = require('../../components/utils'),
  crypto          = require('crypto'),
  braintree       = require('braintree' ),
  paypal          = require( 'paypal-rest-sdk' ),
  redis           = require( "redis" );

var ORDER_STATUS = {
  ASSIGNED: 1,
  COMPLETED: 2,
  PENDING: 3
};

// Braintree config details

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: config.braintree.merchantId,
  publicKey: config.braintree.publicKey,
  privateKey: config.braintree.privateKey
});

/**
 * Creates a new payment. Both PayPal & Braintree payment
 *
 * @param req
 * @param res
 */
exports.create = function(req, res) {

  // PayPal config details
  paypal.configure(config.paypal);

  var client = redis.createClient( config.redis.port, config.redis.host );
  var newOrder = req.body;

  console.log(newOrder);
  // We need to ensure we have the required field.
  if(!newOrder.customer_id ||
    !newOrder.merchant_id ||
    !newOrder.delivery_type ||
    !newOrder.payment_type ||
    !newOrder.details ||
    !newOrder.note ||
    !newOrder.customer.email ||
    !newOrder.customer.name
  ){
    return utils.handlerUserInputException(res);
  }

  // get the merchant info.
      var merchant;
      try {
        console.log('ID: ' +newOrder.merchant_id);
        merchant = getMerchantInfo(newOrder.merchant_id);
        console.log(merchant);
      } catch (exception) {
        console.log('exception : ', exception);
      }
      console.log('merchant::::', merchant);
      newOrder.total = calculateTotalPayment( newOrder.orderPrice, JSON.parse( merchant.Merchant_Group.charges ) ).toString();
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      newOrder.transaction_id = utils.generateTransactionId(ip);
      newOrder.status = ORDER_STATUS.PENDING;

      var carts = JSON.parse( newOrder.details );
      var items = [];
      _.each( carts, function (value) {
        items.push( {
          'name'    : value.name,
          'sku'     : 'item',
          'price'   : value.price,
          'currency': "GBP",
          'quantity': value.quantity
        } )
      } );



  // Check if payment type == PayPal

  if(newOrder.payment_type == "paypal"){

    var create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": config.paypal.redirect_urls.return_url, //will be replaced
        "cancel_url": config.paypal.redirect_urls.cancel_url //will be replaced
      },
      "transactions": [ {
        "amount": {
          "currency": "GBP",
          "total": Math.floor( parseFloat( newOrder.total * 100 ) ) / 100,
          //"details": {
          //  "subtotal": "", // TODO: Get subtotal from local storage in front end
          //  "tax": newOrder.total * 0.20,
          // "handling_fee": newOrder.delivery_fee
          // }
        },
        "description": "This is the payment description."
      } ]
    };
    console.log(create_payment_json.transactions);
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        //throw error;
        console.log(error);
        return res.send(error);

      } else {
        // Insert order into DB
        //console.log(payment);
        client.hmset( payment.id, newOrder );
        client.expire( payment.whyid, 600 );
        return res.envelope(payment.links);
      }
    });

   // If not, must be credit_card
   // We need to ensure payment_method_nonce is obtained

  } else if(newOrder.payment_type = 'credit_card' && newOrder.payment_method_nonce) {
    //newOrder.total = calculateTotalPayment( newOrder.orderPrice, JSON.parse( merchant.Merchant_Group.charges )
    // ).toString();
    gateway.transaction.sale({
      amount: newOrder.total,
      paymentMethodNonce: newOrder.payment_method_nonce,
      customer: {
        firstName: newOrder.customer.name[0],
        lastName: newOrder.customer.name[1],
        phone: newOrder.customer.phone
      }  ,
        billing: {
          firstName: newOrder.customer.name[0],
          lastName: newOrder.customer.name[1],
          phone: newOrder.customer.phone
        }
    }, ( function (err, result) {
      if(err) {
        console.log(err);
        return res.send(err);
      }
      console.log(result);
      return result;
    })
    );
      return res.envelope(newOrder.payment_method_nonce);

  }
};

/**
 * When payment is successful, this function get called.
 * A new order is created in db on order confirmed.
 * // TODO: Add broadcast method to mobile app & management area
 * @param req
 * @param res
 */
exports.confirm = function (req, res) {
  var paymentid = req.body.paymentId;
  var token  = req.body.token;
  var client = redis.createClient( config.redis.port, config.redis.host );
  client.hgetall( paymentid, function (err, newOrder) {
    // create a new order
    if( newOrder ) {
      newOrder.transaction_id = paymentid;
      models.Orders.create( newOrder ).then( function (order, error) {
        if( !order ) utils.handlerServerException( res, error );
        return res.json( 200, {success: true, data: newOrder} );
      } ).catch( function (exception) {
        handlerException( res, exception );
      } );
    } else {
      return res.json( 200, {success: false, data: null} );
    }
  } );
}

/**
 calculate total payment base on orderPrice and charges of merchant_type
 @param {orderPrice} original price of order
 @param changes} additional charge of merchant_type
 @result {}
 */
function calculateTotalPayment(orderPrice, charges){

  // no addition fee
  if (!charges || charges.length == 0)
    return orderPrice;

  // for specal case - just one condition for all price range
  if (charges.length == 1){
    var condition = charges[0];

    // set price range, won't exist this case in reality, just return the price
    if (charges.price){
      return orderPrice;
    } else {
      return orderPrice*( 1 + parseFloat(condition.additionFee));
    }
  }

  // have many condition for each price range
  if (charges.length > 1){
    var counter = 0;
    for (;counter < charges.length; counter++){
      if (orderPrice <= parseFloat(charges[counter].price)){
        break;
      }
    }

    // use previous range
    if (counter == charges.length) counter--;

    return orderPrice*( 1 + parseFloat(charges[counter].additionFee));
  }

}


function getMerchantInfo(merchantId) {
  if( !merchantId ) {
    console.log('here, merchant id :'+ merchantId);
    return 'merchant ID not provided';
  }

  console.log('hereeee', merchantId);
  // get the merchant info.
  models.Merchants.findOne( {
      where  : {
        id: merchantId
      },
      include: [
        {
          model     : models.Merchant_Groups,
          attributes: [ 'name', 'charges' ]
        }
      ]
    } ).then( function (merchant) {
      console.log(merchant);
      return merchant;
  } );
}
/**
 * Obtain client token from braintree
 * @param req
 * @param res
 */
exports.getToken = function (req, res) {
  gateway.clientToken.generate({}, function (err, response) {
    return res.envelope(response.clientToken);
  });
};


/**
 * Exception handler
 * @param res
 * @param ex
 */
function handlerException (res, ex){
  res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}
