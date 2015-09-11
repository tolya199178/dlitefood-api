var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var _ = require('lodash');
var http = require('http');
var querystring = require('querystring');
var post_data = {};
var models  = require('../server/models/');

// An object of options to indicate where to post to
var post_options = {
  host: 'localhost',
  port: '9000',
  path: '/api/locations/',
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

var newDB = new Sequelize(
  'justfast_food', 'root', 'anhlavip', {
    dialect: "mysql",
    logging: false
  });

var query = "select * from locations, restaurants where location_menu_id = restaurants.type_id";

oldDB
  .query(query, {
    type: oldDB.QueryTypes.SELECT
  })

  .then(function(locations) {
    _.each(locations, function(location){
      (function(location){
        newDB.query("select * from merchants where merchants.name = '" + location.type_name + "'", {
          type: oldDB.QueryTypes.SELECT
        }).then(function(merchant){
          if (!merchant.length) return;

          post_data = {
            merchant_id: merchant[0].id,
            category_id: location.category_id,
            location_meal: location.location_meal,
            location_name: location.location_name,
            location_price: location.location_price,
            location_actual_price: location.location_actual_price,
            location_in_stock: location.location_in_stock,
            location_details: location.location_details,
            location_sublocation_price: location.location_sublocation_price
          };

          // user sequelize model to insert to db

        });
      })(location);

    });
  })

  .catch(function(exception) {
    throw new Error({
      exception: exception,
      msg: 'Exception from excecuting sequelize !'
    });
  });
