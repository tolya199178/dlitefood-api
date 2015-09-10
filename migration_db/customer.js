var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var _ = require('lodash');
var http = require('http');
var querystring = require('querystring');
var post_data = {};

// An object of options to indicate where to post to
var post_options = {
  host: 'localhost',
  port: '9000',
  path: '/api/customers/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOjQyNzYsImlhdCI6MTQ0MTc4NzIxNTc5NywiZXhwIjoxNDQxODA1MjE1Nzk3fQ.HWz7H-C5KwOzAdgjIitDfdwZIWakpUVQ3RTE3mGKbQk'
  }
};



var oldDB = new Sequelize(
  'old_fastfood', 'root', 'anhlavip', {
    dialect: "mysql",
    logging: false
  });

var query = "select * from account";

oldDB
  .query(query, {
    type: oldDB.QueryTypes.SELECT
  })

.then(function(customers) {
  console.log(customers.length);

  _.each(customers, function(customer){
    post_data = {
      email: customer.user_email || " ",
      name: customer.user_name || " ",
      password: customer.user_password || " ",
      phoneno: customer.user_phoneno || " ",
      screen_name: customer.user_screen_name,
      address: customer.user_address,
      postcode: customer.user_post_code
    };

    post_data = querystring.stringify(post_data);

    // console.log(post_data);

    // Set up the request
    var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        console.log(chunk);
      });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

  });
})

.catch(function(exception) {
  throw new Error({
    exception: exception,
    msg: 'Exception from excecuting sequelize !'
  });
});