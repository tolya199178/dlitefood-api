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
  path: '/api/orders/',
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

var query = "SELECT * FROM old_fastfood.orders as o,old_fastfood.account as a,old_fastfood.restaurants as r where o.order_user_id = a.id AND o.order_rest_id = r.type_id";

oldDB
.query(query, {
  type: oldDB.QueryTypes.SELECT
})

.then(function(items) {

  _.each(items, function(item){
    (function(item){
      // get merchant id
      newDB.query("select * from merchants where merchants.name = '" + escape(item.type_name) + "'", {
        type: newDB.QueryTypes.SELECT
      }).then(function(merchant){
        if (!merchant.length) return;
        // get user_id
        newDB.query("select customers.id from customers, users where customers.user_id = users.id and users.email = '" + item.user_email + "'", {
          type: newDB.QueryTypes.SELECT
        }).then(function(customer){
          if (!customer.length) return;

          post_data = {
            customer_id: customer[0].id,
            merchant_id: merchant[0].id,
            merchant_type: item.order_rest_id,
            delivery_type: item.order_delivery_type,
            transaction_id: item.order_transaction_id,
            transaction_details: item.order_transaction_details,
            payment_type: item.order_payment_type,
            total: item.order_total,
            details: item.order_details,
            note: item.order_note,
            status: item.order_status,
            acceptance_time: item.order_acceptence_time.toString()
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