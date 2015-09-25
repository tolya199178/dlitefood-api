'use strict';

var models      = require('../../models'),
    config      = require('../../config/environment'),
    utils       = require('../../components/utils'),
    _           = require('lodash');

var LIST_RESTAURANT_ATTRIBUTES = [
        "id",
        "name",
        "email",
        "password",
        "picture",
        "phoneno",
        "time",
        "notes",
        "charges",
        "steps",
        "min_order",
        "opening_hours",
        "category",
        "is_delivery",
        "special_offer",
        "status",
        "date_added",
        "food"
      ]

/**
 * Search restaurant by postcode
 * restriction: 'no'
 * @input {String} postcode
 * @result {Object Array} list restaurant info
 */
var INRANGE_DISTANCE = 100; //KMMETER - To be fetched from database
exports.search = function (req, res) {
  if (!req.query.postcode || !req.query.milesRadius){
    return res.json(400, {success: false, msg: 'Please ensure the right parameters are passed'});
  };

  if (req.query.milesRadius > INRANGE_DISTANCE){
    return res.json(400, {success: false, msg: 'None of our partners is delivery to your area at this time.'});
  }

  utils
    .getEandN(req.query.postcode)
    // .getEandN('PO5 4LN') for testing purpose
    .then(function(postcodes){
      // return when can't find any relevant postcode
      if (postcodes.error || postcodes.data.length <= 1){
        return res.json(400, {success: false, mgs: 'Can\'t find the postcode '});
      }

      // remove the csv header info
      postcodes = postcodes.data;
      postcodes.splice(0, 1);

      try {
        models.Merchants.findAll({
          include: [{ model: models.Locations} ]
        }).then(function(restaurants) {
          var inRangeRestaurants = filterRestaurantsByPostcode(restaurants, postcodes, req.query.milesRadius);

          if(inRangeRestaurants.length === 0 || typeof inRangeRestaurants == 'undefined') {
            return res.json(400, {success: false, msg: 'No merchant within reach' });
          }

          return res.json(200, {sucess: true, data: inRangeRestaurants});
        });
      }
      catch (exception){
        handlerException (res, exception);
      }

    });
};


/**
 * Util for filter restaurant by postcode info
 * @param {Object Array} restaurants
 * @param {Object} postcodes
 * @result {Object Array} filtered restaunrants
 */


var filterRestaurantsByPostcode = function(restaurants, postcodes, inrange_distance){
  inrange_distance = parseFloat(inrange_distance);
  var counter = 0;
  var result = [];
  _.each(restaurants, function(restaurant){
    var nearestLocation = null;
    var nearestDistance = 999999;
    _.each(restaurant.Locations, function(location){
      var loData = utils.extractLocationData(location.location_postcode);
      var resEasting = loData['E'];
      var resNorthing = loData['N'];

      // check if any restaurants's location in range
      postcodes.forEach(function(postcode){
        var postcodeEasting = postcode[3];
        var postcodeNorthing = postcode[4];

        var distance = utils.calcDistanceByNE(resNorthing, postcodeNorthing, resEasting, postcodeEasting);
        distance = parseFloat(distance);
        if (distance <= inrange_distance && nearestDistance > distance){
          nearestLocation = location;
          nearestDistance = distance;
        }

      });
    });

    if (nearestLocation){
      var temp = _.pick(restaurant, LIST_RESTAURANT_ATTRIBUTES);
      temp.distance = nearestDistance;
      temp.nearestLocation =  nearestLocation;
      result.push(temp);
    }

  });
  return result;
}



function handlerException (res, ex){
  res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}
