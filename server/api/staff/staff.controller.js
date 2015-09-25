'use strict';

var models = require('../../models'),
    passport = require('passport'),
    config = require('../../config/environment'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash'),
    staffSocket = require('./staff.socket');

var LIST_STAFF_ATTRIBUTE = [
    'name',
    'address',
    'postcode',
    'max_distance',
    'available_time',
    'location'
  ];

var USER_STATUS = {
  ACTIVE: "1",
  DELIVERING: "2",
  INACTIVE: "3"
};


/**
 * Get list of staffs
 * restriction: 'admin'
 */
exports.index = function(req, res) {

  /*
    Set default value for parameters
  */
  var  keywordForName = req.query.name || "";
  var pageNumber = parseInt(req.query.pageNumber) || 1;
  var pageSize = parseInt(req.query.pageSize) || 20;

  if (keywordForName){
    var whereCondition = {
        name: {
          $like: '%' + keywordForName + '%'
        }
      }
  }
  else{
    var whereCondition = {};
  }

  try {
    models.Staffs.findAll({
      where: whereCondition,
      attributes: LIST_STAFF_ATTRIBUTE,
      offset: (pageNumber-1)*pageSize,
      limit: pageSize,
      include: [{model: models.Users, attributes: ['email', 'phoneno']}]
    }).then(function (staffs) {
       // get email/phoneno info from user
      res.json(200, {success: true, data: staffs});
    })
    .catch(function(exception){
      handlerException (res, exception);
    });;
  } catch (exception){
    handlerException (res, exception);
  }
};

/**
 * Get list of active user
 * restriction: 'admin'
 */
// exports.getActiveStaff = function(req, res) {
//
//
//   try {
//     models.Staffs.findAll({
//       where: {
//         status: USER_STATUS.ACTIVE
//       },
//       attributes: LIST_STAFF_ATTRIBUTE
//     }).then(function (staffs) {
//       res.json(200, {success: true, data: staffs});
//     })
//     .catch(function(exception){
//       res.json(500, {success: false, data: exception, msg: 'Exception thrown !!!'});
//     });
//   } catch (exception){
//     res.json(500, {success: false, data: exception, msg: 'Exception thrown !!!'});
//   }
// };


/**
 * Creates a new user
 * @param {email}
 * @param {phoneno}
 * @param {password}
 * @param {name}
 * @param {address}
 * @param {avaiable_time}
 * @param {max_distance}
 * @param {postcode}
 * @param {role}
 * @result {Object} {success: true/false, id: 'in success case'}
 */

exports.create = function (req, res, next) {
  var newStaff = req.body;
  newStaff.provider = 'local';
  if (!newStaff.email ||
      !newStaff.phoneno ||
      !newStaff.password ||
      !newStaff.name ||
      !newStaff.address ||
      !newStaff.available_time ||
      !newStaff.max_distance ||
      !newStaff.postcode ||
      !newStaff.role
      ){
    return res.json(400, {success: false, msg: 'You must pass in mandatory fields !'});
  }

  // Must create user-account first
  models.Users.createUser({
    email: newStaff.email,
    phoneno: newStaff.phoneno,
    password: newStaff.password,
    name: newStaff.name,
    role: newStaff.role,
    type: 'staff'
  }, function(result){

    // can't create user
    if (!result.success){
      return res.json(400, result);
    }

    // create staff with user info
    models.Staffs.create({
      name: newStaff.name,
      address: newStaff.address,
      postcode: newStaff.postcode,
      max_distance: newStaff.max_distance,
      available_time: newStaff.available_time,
      title: newStaff.title,
      location: newStaff.location || '',
      user_id: result.user.id
    }).then(function(staff){
      if (!staff) res.json(400, {success: false, msg: 'Unknow issue !!'});

      res.json(200, {success: true, data: staff});
    })
    .catch(function(exception){
      handlerException (res, exception);
    });

  });

};


/**
 * Update a staff information
 * restriction: 'admin'
 * @param {email}
 * @param {phoneno}
 * @param {password}
 * @param {name}
 * @param {address}
 * @param {avaiable_time}
 * @param {max_distance}
 * @param {postcode}
 * @param {role}
 * @result {Object} {success: true/false}
 * @description
 *  There a two kind of information we need update,
 *    - first for user info: email, phoneno, password
      - sencond
 *  Staff information.
 */
exports.update = function(req, res) {
  if (!req.params.id){
    return res.json(400, {success: false, msg: 'You must pass in staff !'});
  }

  models.Staffs.findOne({
    where: {
      id: req.params.id
    },
    include: [{model: models.Users}]
  }).then(function(staff){
    if (!staff) return res.json(404,{success: false, data: 'Can\'t find the staff ' });
    // staff = _.merge(staff, req.body);

    // update staff info
    models.Staffs
      .update(req.body, {
        where: {
          id: staff.id
        }
      })
      .then(function(result){
        if (!result)  return res.json(500,{success: false, data: 'Can\'t update the staff info' });

        // update user info
        var user = {
          password: req.body.password,
          email: req.body.email,
          phoneno: req.body.phoneno,
          id: staff.User.id
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
 * Deletes a staff
 * restriction: 'admin'
 * @param {INT} staffId in params.id
 * @result {Object} {success: true/false}
 */
exports.destroy = function(req, res) {
  if (!req.params.id){
    return res.json(400, {success: false, msg: 'You must pass in staff !'});
  }

  models.Staffs.findOne({
    where: {
      id: req.params.id
    },
    include: [{model: models.Users}]
  }).then(function(staff){
    if (!staff) return res.json(404,{success: false, data: 'Can\'t find the staff ' });

    // delete linked user, we use cascade on User vs Staff
    // so when we delete user, the staff will be delete too

    models.Users.destroy({
      where: {
        id: staff.User.id
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



/*
  Get nearest active staff depend on input postcode(EN)
  @param {Float} postcode Easting
  @param {Float} postcode Northing
  @param {Object} nearest driver
*/

exports.getNearest = function(req, res) {
  if (!req.query.E || !req.query.N) {
    return res.json(400, {
      success: false,
      msg: 'Please pass in right data'
    });
  };

  try {

    var easting = parseFloat(req.query.E),
        northing = parseFloat(req.query.N),
        nearestDriver = null,
        nearestDistance = 999999,
        latLon = utils.ENToLatLon(easting, northing);

    // get nearest driver base on order location
    models.Staffs.findAll({
      where: {
        status: STAFF_STATUS.ACTIVE.toString()
      }
    }).then(function(staffs) {
      _.each(staffs, function(staff) {
        var maximumDistance = parseFloat( staff.max_distance );

        // can't find the real staff location
        // we will use staff_postcode to find
        if( !staff.location ) {
          loData = utils.extractLocationData( staff.postcode );
          var postcodeEasting = loData['E'],
            postcodeNorthing = loData['N'];
        } else {
          /*
            If we can found latest staff location, need convert it
          */
          staff.location = JSON.parse( staff.location );
          var loData     = utils.LLtoNE( staff.location.lat, staff.location.lon )
          var postcodeEasting = loData['E'],
            postcodeNorthing = loData['N'];
          staff.latLon = loData;
        }

        var distance = utils.calcDistanceByNE(northing, postcodeNorthing, easting, postcodeEasting);
        if (distance <= maximumDistance && distance < nearestDistance) {
          nearestDriver = staff;
          nearestDriver.latLon = staff.latLon || utils.ENToLatLon(postcodeEasting, postcodeNorthing);
          nearestDistance = distance;
        }
      });

      if (nearestDriver){
        var result = _.pick( nearestDriver, [ 'id', 'name', 'email', 'postcode', 'phoneno', 'latLon' ] );
        result.distance = nearestDistance;

        return res.json( 200, {success: true, data: result} );
      }else{
        return res.json( 404, {success: false, msg: 'Not found any driver near by'} );
      }


    });

  } catch (exception) {
    return res.json(500, {success: false, data: exception});
  }

};

/**
 Update staff location
 @param {Integer} staff id
 @param {Float} Latitude
 @param {Float} Longtitude
 */
exports.updateLocation = function (req, res) {
  if( !req.body.lat || !req.body.lon ) {
    return res.json( 400, {
      success: false,
      msg    : 'Please pass in right data'
    } );
  }
  ;

  try {
    models.Staffs
      .findOne( {
        where: {
          id: req.staff.id
        }
      } )
      .then( function (staff) {
        if( !staff ) {
          return res.json( 404, {
            success: false,
            msg    : 'Can\'t find the staff '
          } );
        }

        models.Staffs.update( {
          location: JSON.stringify( {
            lat: req.body.lat,
            lon: req.body.lon
          } ),
        }, {
          where: {
            id: req.staff.id
          }
        } ).then( function (result) {
          if( result[ 0 ] == 1 ) {
            userSocket.broadcastData( 'staff:location_change', {
              id : req.staff.id,
              lat: req.body.lat,
              lon: req.body.lon
            } );
            return res.json( 200, {
              sucess: true
            } );
          }
          else
            return res.json( 422, {
              success: false,
              msg    : 'Please double check the input lat lon. '
            } );
        } );

      } );
  } catch (exception) {
    return res.json( 500, {
      success: false,
      data   : exception
    } );
  }

};

/*
 Update staff location
 @param {Integer} staff id
 @param {Interge} Status
 */
var STAFF_STATUS = {
  ACTIVE    : 1,
  DELIVERING: 2,
  INACTIVE  : 3
};

/**
 * Update staff location
 * @param req
 * @param res
 * @returns {*}
 */
exports.changeStatus = function (req, res) {


  if( !req.body.status ) {
    return res.json( 400, {
      success: false,
      msg    : 'Please pass in right data'
    } );
  }

  try {
    models.Staffs
      .findOne( {
        where: {
          id: req.user.id
        }
      } )
      .then( function (staff) {
        if( !staff ) {
          return res.json( 404, {
            success: false,
            msg    : 'Can\'t find the staff '
          } );
        }

        models.Staffs.update( {
          status: req.body.status.toString(),
        }, {
          where: {
            id: req.user.id
          }
        } ).then( function (result) {
          if( result[ 0 ] == 1 ) {
            staff.status = req.body.status;
            userSocket.broadcastData( 'staff:status_change', staff );
            return res.json( 200, {
              sucess: true
            } );
          }
          else
            return res.json( 422, {
              success: false,
              msg    : 'Please double check the input lat lon. '
            } );
        } );

      } );
  } catch (exception) {
    return res.json( 500, {
      success: false,
      data   : exception
    } );
  }

};

function handlerException (res, ex){
  res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}
