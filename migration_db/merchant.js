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
  path: '/api/merchants/',
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

var query = "select * from restaurants";

oldDB
  .query(query, {
    type: oldDB.QueryTypes.SELECT
  })

.then(function(restaurants) {
  _.each(restaurants, function(restaurant){
    post_data = querystring.stringify({
      email: restaurant.type_email || " ",
      name: restaurant.type_name || " ",
      password: restaurant.type_password || " ",
      phoneno: restaurant.type_phoneno || " ",
      picture: restaurant.type_picture,
      time: restaurant.type_time,
      notes: restaurant.type_notes || " ",
      min_order: parseInt(restaurant.type_min_order) || 1,
      charges: restaurant.type_charges,
      steps: restaurant.type_steps,
      opening_hours: restaurant.type_opening_hours,
      category: restaurant.type_category,
      is_delivery: restaurant.type_is_delivery,
      special_offer: restaurant.type_special_offer || " "
    });

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