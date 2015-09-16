'use strict';

var _ = require('lodash');
var config = require('../../config/environment');
var models = require('../../models');
var crypto = require('crypto');
var utils  = require('../../components/utils');

var ROLES = {
  ADMIN: 1,
  SUPERVISOR: 2,
  STAFF: 3,
  MERCHANT: 4,
  CUSTOMER: 5
}

var CUSTOMER_STATUS = {
  ACTIVE: '1',
  INACTIVE: '2'
};

// Get list of customers
exports.index = function(req, res) {

  try {
    models.Customers.findAll({
      include: [
        {
          model: models.Users,
          attributes: ['id', 'email', 'phoneno', 'status']
        }
      ]
    } ).then( function (customers) {
      return res.json(200, {success: true, data: customers });
    } ).catch( function (exception) {
      return res.json(500, {success: false, data: exception.toString(), msg: 'Exception thrown. Please review request params.'});
    })
  } catch (exception) {
    handleError(res, exception);
  }
};


var USER_STATUS = {
  ACTIVE: "1",
  DELIVERING: "2",
  INACTIVE: "3"
};
/*
  Signup function for customer with email
  @param {String}  screen_name
  @param {String}  email
  @param {String}  name
  @param {String}  postcode
  @param {String}  password
*/

exports.create = function(req, res) {
  var customer = req.body;

  if (!customer.screen_name ||
    !customer.email ||
    !customer.postcode ||
    !customer.password ||
    !customer.name
  ){
    return utils.handlerUserInputException(res);
  }

  // generate token to verify in email
  crypto.randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');

    // Must create user-account first and disabled it
    // this token will expired in 24 hours
    models.Users.createUser({
      email: customer.email,
      password: customer.password,
      name: customer.name,
      role: ROLES.CUSTOMER,
      type: 'customer',
      status: USER_STATUS.INACTIVE,
      token: token,
      token_expired: (new Date()).getTime() + 24*60*60*1000
    }, function(result, error){

      // can't create user
      if (!result.success){
        return utils.handlerServerException(res, result.msg);
      }

      customer.user_id = result.user.id;
      
      // create customer with user info
      models.Customers.create(customer).then(function(result){
        if (!result) return utils.handlerNotFoundException(res);

        //send email to verify email with above token
        utils.sendMail({
          emails: [customer.email],
          header: "[Dlites] Verification  Email",
          content: 'Click here http://localhost:9001/api/customers/verifyemail?token=' + token
        }, function(res){
          console.log(res);
        });
        
        //return result
        utils.handleSuccess(res, result);
      })
      .catch(function(exception){
        utils.handlerSequelizeException(res, exception);
      });
  });

  });
};



/*
  Verify email, after sign up people must verify their email
*/

exports.verifyEmail = function(req, res){
  if (!req.query.token){
    return utils.handlerUserInputException(res);
  }

  models.Users.findOne({
    where: {
      token: req.query.token
    }
  }).then(function(user){
    if (!user) return utils.handlerNotFoundException(res);

    if (new Date(user.token.token_expired) < new Date())
      return res.json(400, {success: false, msg: 'Token has expired !'});

    // update the user status
    user.update({
      status: USER_STATUS.ACTIVE,
      token: "",
      token_expired: ""
    }).then(function(result){
      utils.handleSuccess(res, result);
    })
    .catch(function(exception){
      utils.handlerSequelizeException(res, exception);
    });

  })
  .catch(function(exception){
    utils.handlerSequelizeException(res, exception);
  })
}