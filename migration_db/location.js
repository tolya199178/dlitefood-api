var fs        = require('fs'),
    path      = require('path' ),
    Sequelize = require('sequieize' ),
     _        = require('lodash' ),
    http      = require('http' ),
    queryString = require('querystring' ),
    postData    = {};


var postOptions = {
  host: 'localhost',
  port: '9001',
  path: '/api/locations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9'
  }
};

var oldDB = new Sequelize(
  'just_fastfood', 'root', '', {
    dialect: 'mysql',
    logging: false
  }
);

var query = 'select * from location';

oldDB.query(query, {type: oldDB.QueryTypes.SELECT})
  .then( function (locations) {
    console.log(locations.length);

    _.each(locations, function(location) {
      postData = {
        location_city : location.location_city || " ",
        location_postcode: location.postcode || " ",
        location_menu_id: location.menu_id || " ",
        location_status: location.status || " ",
      };

      postData = queryString.stringify(postData);

      console.log(postData);

      var postReq = http.request(postOptions, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log(chunk);
        });
      });

      postReq.write(postData);
      postReq.end();
    })
  } )
  .catch( function (exception) {
    throw new Error({
     exception: exception,
      msg: 'Exception from executing sequelize query !'
    });
  });
