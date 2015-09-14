'use strict';

var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var models = require('../models');
var _ = require('lodash');
var sequelize = require('sequelize');
var validateJwt = expressJwt({ secret: config.secrets.session });

var USER_STATUS = {
  ACTIVE: "1",
  DELIVERING: "2",
  INACTIVE: "3"
};
/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      models.Users.findOne({
        where: {
          id: req.user._id,
          status: {
            $in: [USER_STATUS.ACTIVE, USER_STATUS.DELIVERING]
          }
        }
      }).then(function (user) {
        if (!user) return res.send(401);

        req.user = user;
        next();
      });
    });
}

/**
 * Deprecated - no longer using
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      // if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
      //   next();
      // }
      // else {
      //   res.send(403);
      // }
      next();
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasPermission(permissionRequired, action) {
  if (!permissionRequired || !action) throw new Error('Required permission/action needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      // get permissions with current user role
      if (!req.user.role)
        return res.send(403);

      models.sequelize
        .query('Select rp.value, p.alias, p.name from Permissions as p, Role_Permission as rp ' +
                'Where rp.role = ' + req.user.role + ' and rp.permission = p.id',
                { type: models.sequelize.QueryTypes.SELECT})
        .then(function(data){
          if (!data.length)
            return res.send(403);

          var permissions = data;
          var userPermission = _.find(permissions, function(permission){
            return permission.alias == permissionRequired;
          });

          if (userPermission) {
            req.user.permissions = permissions;
            
            //FIND OUT PERMISSION VALUE
            if (userPermission['READ'] = userPermission.value >> 3 >= 1)
              userPermission.value -= 8;

            if (userPermission['UPDATE'] = userPermission.value >> 2 >= 1)
              userPermission.value -= 4;

            if (userPermission['CREATE'] = userPermission.value >> 1 >= 1)
              userPermission.value -= 2;

            if (userPermission['DELETE'] = userPermission.value >> 0 >= 1)
              userPermission.value -= 1;

            if (userPermission[action])
              next();
            else
              res.send(403);
          }
          else {
            res.send(403);
          }
        });

    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*5 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.status(404).json({ message: 'Something went wrong, please try again.'});
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.hasPermission = hasPermission;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;