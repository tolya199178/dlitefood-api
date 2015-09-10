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
  path: '/api/items/',
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

var query = "SELECT * FROM old_fastfood.items as i, old_fastfood.restaurants as r where i.type_id = r.type_id";

oldDB
  .query(query, {
    type: oldDB.QueryTypes.SELECT
  })

.then(function(items) {
  console.log(items.length);
  _.each(items, function(item){
    (function(item){
      newDB.query("select * from merchants where merchants.name = '" + item.type_name + "'", {
        type: oldDB.QueryTypes.SELECT
      }).then(function(merchant){
        if (!merchant.length) return;
        
        post_data = {
          merchant_id: merchant[0].id,
          category_id: item.category_id,
          item_meal: item.item_meal,
          item_name: item.item_name,
          item_price: item.item_price,
          item_actual_price: item.item_actual_price,
          item_in_stock: item.item_in_stock,
          item_details: item.item_details,
          item_subitem_price: item.item_subitem_price
        };

        post_data = querystring.stringify(post_data);

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
    })(item);
    
  });
})

.catch(function(exception) {
  throw new Error({
    exception: exception,
    msg: 'Exception from excecuting sequelize !'
  });
});