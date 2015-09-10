'use strict';

var _ = require('lodash');
var config = require('../../config/environment');
var models = require('../../models');



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

/**
 * Creates a new customer
 * @param {name}
 * @param {screen_name}
 * @param {address}
 * @param {postcode}
 * @param {user_id}
 * @param req
 * @param res
 * @param next
 */
exports.create = function (req, res, next) {
  try {
    var newCustomer = req.body;
    newCustomer.status = newCustomer.status || CUSTOMER_STATUS.ACTIVE;

    /*
     check mandatory fields
     */
    if(!newCustomer.name ||
      !newCustomer.screen_name ||
      !newCustomer.address ||
      !newCustomer.postcode ||
      !newCustomer.email ||
      !newCustomer.password ||
      !newCustomer.phoneno
    ) {
      console.log(newCustomer);
      return res.json(400, {success: false, msg: 'Please pass in required fields to create a customer.'});
    }

    // Lets create a user-account first
    models.Users.createUser({
      email: newCustomer.email,
      phoneno: newCustomer.phoneno,
      password: newCustomer.password,
      name: newCustomer.name,
      role: ROLES.CUSTOMER,
      type: 'customer'
    }, function (result) {
      // can't create user
      if(!result.success) {
        return res.json(400, result);
      }
      newCustomer.user_id = result.user.id;

      // create customer with user info
      models.Customers.create(newCustomer)
        .then( function (customer) {
          if(!customer) res.json(400, { success: false, msg: 'Cant return customer after saving. Please review request.'})
          res.json(200, { success: true, data: customer});
        } )
    });

  } catch(exception) {
    handleError(res, exception);
  }
};

function handleError(res, err) {
  return res.send(500, err);
}
