'use strict';

var models          = require('../../models'),
    passport        = require('passport' ),
    config          = require('../../config/environment' ),
    _               = require('lodash' ),
    utils           = require('../../components/utils'),
    crypto          = require('crypto');

var ORDER_STATUS = {
  ASSIGNED: 1,
  COMPLETED: 2,
  PENDING: 3
}

// Creates a new order in the DB.
exports.create = function(req, res) {
  var newOrder = req.body;

  if (!newOrder.customer_id ||
    !newOrder.merchant_id ||
    !newOrder.orderPrice ||
      // !newOrder.merchant_type || -> can get it in merchant info, should remove this colum
    !newOrder.delivery_type ||
      // !newOrder.transaction_id || --> this one will be generated
    !newOrder.transaction_details ||
    !newOrder.payment_type ||
    !newOrder.details ||
    !newOrder.note ||
    !newOrder.status ||
    !newOrder.acceptance_time
  ){
    return utils.handlerUserInputException(res);
  }

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
      if (!merchant) utils.handlerNotFoundException(res)
      newOrder.total = calculateTotalPayment(newOrder.orderPrice, JSON.parse(merchant.Merchant_Group.charges)).toString();

      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      newOrder.transaction_id = utils.generateTransactionId(ip);
      newOrder.status = ORDER_STATUS.PENDING;

      // create a new order
      models.Orders.create(newOrder).then(function(order, error){
        if (!order) utils.handlerServerException(res, error);

        utils.handleSuccess(res, order);
      })
        .catch(function(exception){
          handlerException (res, exception);
        });

    })
    .catch(function(ex){
      utils.handlerSequelizeException(res, ex);
    });

};

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



/**
 * Return list of orders
 * @param req
 * @param res
 */
exports.index = function(req, res) {
  req.query.limitTo = req.query.limitTo || 20;

  models.Orders.findAll({
    where: {'status': req.query.orderStatus},
    limit: req.query.limitTo,
    order: 'updatedAt DESC'
  }).then( function (orders, error) {
    if(error) {
      return res.send(error);
    }

    return res.json(200, {success: true, data: orders});
  })
};

/**
 * Returns few objects for the home page
 * order population.
 * @param req
 * @param res
 */
exports.getFew = function (req, res) {
  var result = [];
  models.Orders.findAll({
    where: {'status' : req.query.orderStatus},
    limit: req.query.limitTo,
    include: [{model: models.Customers, required: true}],
    order: 'updatedAt DESC'
  }).then( function (orders, error) {
    if(error) {
      return res.send(error);
    }
    _.each(orders, function (value) {

      result.push({
        orderDetails: value.dataValues.details,
        orderDateAdded: value.dataValues.acceptance_time,
        orderedBy: value.dataValues.Customer.dataValues.screen_name
      });
    });

    return res.json(200, {success: true, data: result});
  });
};


/**
 * Get Order start point and stop point
 * restriction: 'public'
 * @input {String} orderId
 * @result {Object Array} Order start point and end point
 */
exports.calculateOrderStartStopPosition = function (req, res) {
  if (!req.query.order){
    return res.json(400, {success: false, msg: 'Please pass in order !'});
  }
  try {
    models.Orders
      .findOne({
        where: {
          order_id: req.query.order,
          order_status: ORDER_STATUS.PENDING
        }
      })
      .then(function(order){
        if (!order){
          return res.json(404, {success: false, msg: 'Can\'t find the order with input id'});
        };

        var loData = utils.extractLocationData(order.orderPostcode),
            orderEasting = loData['E'],
            orderNorthing = loData['N'],
            nearestDriver = {},
            nearestDistance = 999999,
            latLon = utils.ENToLatLon(orderEasting, orderNorthing);

        // get nearest driver base on order location
        models.Staffs.findAll({}).then(function(staffs){
          _.each(staffs, function(staff){
            var   maximumDistance = parseFloat(staff.staff_max_distence);

            // can't find the real staff location
            // we will use staff_postcode to find
            if (!staff.staff_location){
              loData = utils.extractLocationData(staff.staff_postcode);
              var   postcodeEasting = loData['E'],
                    postcodeNorthing = loData['N'];
            }
            else{
              /*
               If we can found latest staff location, need convert it
               */
              staff.staff_location = JSON.parse(staff.staff_location);
              var   loData = utils.LLtoNE(staff.staff_location.lat, staff.staff_location.lon)
              var   postcodeEasting = loData['E'],
                    postcodeNorthing = loData['N'];
              staff.latLon = loData;
            }

            var distance = utils.calcDistanceByNE(orderNorthing, postcodeNorthing, orderEasting, postcodeEasting);
            if (distance <= maximumDistance && distance <nearestDistance ){
              nearestDriver = staff;
              nearestDriver.latLon = staff.latLon || utils.ENToLatLon(postcodeEasting, postcodeNorthing);
              nearestDistance = distance;
            }
          });

          var result = _.pick(order, ['id', 'orderMerchantType', 'orderDeliveryType', 'orderPostcode', 'orderPhoneNo']);
          result.latLon = latLon;
          result.nearestDriver = _.pick(nearestDriver, ['staff_id', 'staff_name', 'staff_email', 'staff_postcode', 'staff_phoneno', 'latLon']);
          return res.json(200, {success: true, data: result});
        });

      });
  }
  catch (exception){
    handlerException(res, exception);
  }

};



function handlerException (res, ex){
  res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}
