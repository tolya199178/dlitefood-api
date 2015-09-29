'use strict';


var models          = require('../../models'),
  passport        = require('passport' ),
  config          = require('../../config/environment' ),
  _               = require('lodash' ),
  utils           = require('../../components/utils'),
  crypto          = require('crypto'),
    redis  = require( 'redis' ),
    client = redis.createClient(),
  paypal          = require('paypal-rest-sdk');

var ORDER_STATUS = {
  ASSIGNED: 1,
  COMPLETED: 2,
  PENDING: 3
};

client.on( 'error', function (error) {
  console.log( 'error in redis ', error );
} );
exports.create = function(req, res) {
  paypal.configure(config.paypal);
  var newOrder = req.body;

  if (!newOrder.customer_id ||
    !newOrder.merchant_id || !newOrder.total ||
    !newOrder.delivery_type ||
    !newOrder.transaction_details ||
    !newOrder.payment_type ||
    !newOrder.details ||
    !newOrder.note ||
    !newOrder.status ||
    !newOrder.acceptance_time||
    !newOrder.email
  ){
    return utils.handlerUserInputException(res);
  }
  if(newOrder.payment_type == "paypal"){
    // get the merchant info and
    models.Merchants
      .findOne({
        where: {
          id: newOrder.merchant_id
        },
        include: [
          {
            model: models.Merchant_Groups,
            attributes: ['name', 'charges']
          }
        ]
      })
      .then(function(merchant){
        if( !merchant ) utils.handlerNotFoundException( res );
        //newOrder.total = calculateTotalPayment(newOrder.total,
        // JSON.parse(merchant.Merchant_Group.charges)).toString();
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        newOrder.transaction_id = utils.generateTransactionId(ip);
        newOrder.status = ORDER_STATUS.PENDING;

        console.log( newOrder.total );
        var create_payment_json = {
          "intent": "sale",
          "payer": {
            "payment_method": "paypal",
            "payer_info": {

            }
          },
          "redirect_urls": {
            "return_url": config.paypal.redirect_urls.return_url,
            "cancel_url": config.paypal.redirect_urls.cancel_url
          },
          "transactions": [
            {
              "amount"     : {
                "currency": "GBP",
                "total"   : newOrder.total,
                "details" : {
                  "subtotal"    : "30.00",
                  "tax"         : "2.00",
                  "handling_fee": "3.00"
                }
              },
              "description": "Payment for a new order, ID " + newOrder.order_no
            }
          ]
        };
        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
            res.json( 500, {success: false, msg: 'An error occurred: ' + error} );
          } else {
            client.hmset( "payment_id", payment.id );
            client.hmset( 'customer_id', newOrder.customer_id )
            res.json( payment );
          }
        });
      })
      .catch(function(ex){
        utils.handlerSequelizeException(res, ex);
      });
  }
}

exports.confirm = function (req, res) {
  var paymentid = req.query.paymentId;
  client.hgetall( paymentid, function (err, newOrder) {
    // create a new order
    newOrder.transaction_id = paymentid;
    models.Orders.create( newOrder ).then( function (order, error) {
      if( !order ) utils.handlerServerException( res, error );
      utils.handleSuccess( res, order );
    } ).catch( function (exception) {
      handlerException( res, exception );
    } );
  } );
}

/*
 calculate total payment base on orderPrice and charges of merchant_type
 @param {orderPrice} original price of order
 @param {changes} additional charge of merchant_type
 @result {}
 */
function calculateTotalPayment(orderPrice, charges){

  // no addition fee
  if (!charges || charges.length == 0)
    return orderPrice;

  // for special case - just one condition for all price range
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

function handlerException (res, ex){
  res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}
