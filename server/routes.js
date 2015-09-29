/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {


  app.use(function(req, res, done) {
    res.envelope = function (data, err) {
      var code = res.statusCode;

      // When there are data in the returned object
      res.json({
        data: data || null,
        meta: (err) ? {messages: [err.message || err.msg]} : {},
        status: (code >= 200 ? 'success' : 'error'),
        statusCode: code
      })

    };

    res.error = function (statusCode, message) {

      var statusMsg;
      switch (statusCode) {

        case 305:
          statusMsg = 'Postcode_Unavailable';
          break;
        case 400:
          statusMsg = 'Bad Request';
          break;
        case 404:
          statusMsg = 'Unrecognised request';
          break;
        case 500:
          statusMsg = 'Server Error';
          break;
        case 401:
          statusMsg = 'Unauthorized';
          break;

        return statusCode;

      }

      res.json({
        status: statusMsg,
        statusCode: statusCode,
        msg : message
      })
    };
    done();
  });

  // Insert routes below
  app.use('/api/locations', require('./api/location'));
  app.use('/api/merchant_groups', require('./api/merchant_group'));
  app.use('/api/orders', require('./api/order'));
  app.use('/api/customers', require('./api/customers'));
  app.use('/api/items', require('./api/item'));
  app.use('/api/staffs', require('./api/staff'));
  app.use('/api/roles', require('./api/role'));
  app.use('/api/merchants', require('./api/merchant'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/postcodes', require('./api/postcodes'));

  app.use( '/api/payment', require( './api/payment' ) );

  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });

  /**
   * Using envelope to encapsulate  returned object
   *
   */

};
