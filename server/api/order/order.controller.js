'use strict';

var models          = require('../../models'),
    passport        = require('passport' ),
    config          = require('../../config/environment' ),
    _               = require('lodash' );


// Creates a new order in the DB.
exports.create = function(req, res) {
  var newOrder = req.body;

  console.log(newOrder.acceptance_time);
  if (!newOrder.customer_id ||
      !newOrder.merchant_id ||
      !newOrder.merchant_type ||
      !newOrder.delivery_type ||
      !newOrder.transaction_id ||
      !newOrder.transaction_details ||
      !newOrder.payment_type ||
      !newOrder.total ||
      !newOrder.details ||
      !newOrder.note ||
      !newOrder.status ||
      !newOrder.acceptance_time
      ){
    return res.json(400, {success: false, msg: 'Please ensure to pass the required parameters to api!'});
  }

  // create merchant with user info
  models.Orders.create(newOrder).then(function(order){
    if (!order) res.json(400, {success: false, msg: 'Unknow issue !!'});

    res.json(200, {success: true, data: order});
  })
  .catch(function(exception){
    handlerException (res, exception);
  });

};



/**
 * Return list of orders
 * @param req
 * @param res
 */
exports.index = function(req, res) {
  models.Orders.findAll({
   where: {'status': req.query.orderStatus},
    limit: req.query.limitTo,
    order: 'updatedAt DESC'
  }).then( function (orders, error) {
    if(error) {
      return res.send(error);
    }
    return res.envelope(orders);
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
      console.log(value.dataValues.Customer.dataValues.screen_name);
      result.push({
        orderDetails: value.dataValues.details,
        orderDateAdded: value.dataValues.acceptance_time,
        orderedBy: value.dataValues.Customer.dataValues.screen_name
      });
    });

    return res.envelope(result);
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
    return res.json(400, {sucess: false, msg: 'Please pass in order !'});
  }
  try {
    models.Orders
    .findOne({
      where: {
        order_id: req.query.order,
        order_status: ORDER_STATUS.WAITING
      }
    })
    .then(function(order){
      if (!order){
        return res.json(404, {sucess: false, msg: 'Can\'t find the order with input id'});
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
    return res.json(500, {sucess: false, data: exception});
  }

};



function handlerException (res, ex){
  res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}
