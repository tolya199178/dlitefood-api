'use strict';

var _             = require('lodash');
var models        = require('../../models');
var passport      = require('passport');
var config        = require('../../config/environment');

// Get list of locations --
exports.index = function(req, res) {

  try {
    models.Locations.findAll(
      {
        include: [
          {
            model: models.Merchants,
            attributes: ['name', 'picture', 'user_id', 'food']
          }
        ]
      }
    ).then( function (locations) {
        return res.json(200, { success: true, data: locations});
      } ).catch( function (exception) {
        return res.json(500, { success: false, msg: "Exception occurred. Couldn't fetch locations: "+ exception});
      })

  } catch (exception) {
    handleError(res, exception);
  }

};


// Creates a new location in the DB.
exports.create = function(req, res) {

  var newLocation = req.body;
  if(!newLocation.location_city ||
     !newLocation.location_postcode ||
     !newLocation.location_menu_id ||
     !newLocation.status
    ) {
      return res.json(400, {success: false, msg: 'Please pass in require parameters to create location'});
  }


  Location.create(req.body, function(err, location) {
    if(err) { return handleError(res, err); }
    return res.json(201, location);
  });
};



function handleError(res, err) {
  return res.send(500, err);
}
