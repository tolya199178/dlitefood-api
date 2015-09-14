'use strict';
var csvParser = require('csv-parse'),
  Promise = require('bluebird'),
  http = require('http'),
  _ = require('lodash'),
  crypto = require('crypto'),
  aws = require('aws-sdk');

var Utils = {};

/*
  Get Distance between two point on earth with lat lon
  The formula is based on haversine formula
  @param {Float} lat1
  @param {Float} lat2
  @param {Float} lon1
  @param {Float} lon2
  @return {Float} distance
*/
Utils.calcDistanceByHarversine = function(lat1, lat2, lon1, lon2) {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }

  var R = 6371;
  var x1 = lat2 - lat1;
  var dLat = x1.toRad();
  var x2 = lon2 - lon1;
  var dLon = x2.toRad();
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return d = R * c;

}

/*
  Get Distance between two point on earth with Easting Northing
  @param {Float} n1
  @param {Float} n2
  @param {Float} e1
  @param {Float} e2
  @return {Float} distance
*/
var KM_TO_MILES = 0.621371192;
Utils.calcDistanceByNE = function(n1, n2, e1, e2) {
  return (Math.sqrt((n1 - n2) * (n1 - n2) + (e1 - e2) * (e1 - e2)) / 1000 * KM_TO_MILES).toFixed(2);
}



/*
  Extract the E N data location from system data like
  input: {"SW3 1NF":{"E":"527432","N":"179289"}}
  output: {"E":"527432","N":"179289"}
  @param {String/Object} postcode_location
  @return {Object} placeInfo {E: , N:}
*/
Utils.extractLocationData = function(postcode_location) {
  try {
    if (typeof postcode_location == 'string') {
      var loData = JSON.parse(postcode_location);
    };
    return loData[_.keys(loData)[0]];
  } catch (exception) {
    throw exception;
  }
}

/*
  Get place information base on postcode and list UK postcode on

  @param {string} postcode
  @return {Object} placeInfo
*/
var UKPostcodeSource = 'http://www.doogal.co.uk/UKPostcodesCSV.php';
Utils.getEandN = function(postcode) {
  postcode = postcode.replace(' ', '%20');

  var targetUrl = UKPostcodeSource + '?Search=' + postcode;

  return new Promise(function(resolve, reject) {
    var req = http.get(targetUrl, function(res) {
      var output = '';
      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        output += chunk;
      });

      // get all csv data, return the parsed result
      res.on('end', function() {
        csvParser(output, {}, function(err, res) {
          resolve({
            error: false,
            data: res
          });
        });
      });
      // end return data
    });

    req.on('error', function(err) {
      resolve({
        error: true,
        data: err
      });
    });

    req.end();
  });

}


/*
  Convert British national grid to lat lon for using in google map
  @param {Float} Easting
  @param {Float} Northing
  @result {Object} Object with lat lon
*/
Utils.ENToLatLon = function(E, N) {

  //E, N are the British national grid coordinates - eastings and northings
  var a = 6377563.396;
  var b = 6356256.909; //The Airy 180 semi-major and semi-minor axes used for OSGB36 (m)
  var F0 = 0.9996012717; //scale factor on the central meridian
  var lat0 = 49 * Math.PI / 180; //Latitude of true origin (radians)
  var lon0 = -2 * Math.PI / 180; //Longtitude of true origin and central meridian (radians)
  var N0 = -100000;
  var E0 = 400000; //Northing & easting of true origin (m)
  var e2 = 1 - (b * b) / (a * a); //eccentricity squared
  var n = (a - b) / (a + b);

  //Initialise the iterative variables
  var lat = lat0;
  var M = 0;

  while (N - N0 - M >= 0.00001) { //Accurate to 0.01mm

    lat = (N - N0 - M) / (a * F0) + lat;
    var M1 = (1 + n + (5. / 4) * Math.pow(n, 2) + (5. / 4) * Math.pow(n, 3)) * (lat - lat0);
    var M2 = (3 * n + 3 * Math.pow(n, 2) + (21. / 8) * Math.pow(n, 3)) * Math.sin(lat - lat0) * Math.cos(lat + lat0);
    var M3 = ((15. / 8) * Math.pow(n, 2) + (15. / 8) * Math.pow(n, 3)) * Math.sin(2 * (lat - lat0)) * Math.cos(2 * (lat + lat0));
    var M4 = (35. / 24) * Math.pow(n, 3) * Math.sin(3 * (lat - lat0)) * Math.cos(3 * (lat + lat0));
    //meridional arc
    M = b * F0 * (M1 - M2 + M3 - M4);
  }
  //transverse radius of curvature
  var nu = a * F0 / Math.sqrt(1 - e2 * Math.pow(Math.sin(lat), 2));

  //meridional radius of curvature

  var rho = a * F0 * (1 - e2) * Math.pow((1 - e2 * Math.pow(Math.sin(lat), 2)), (-1.5));
  var eta2 = nu / rho - 1
  var secLat = 1. / Math.cos(lat);
  var VII = Math.tan(lat) / (2 * rho * nu);
  var VIII = Math.tan(lat) / (24 * rho * Math.pow(nu, 3)) * (5 + 3 * Math.pow(Math.tan(lat), 2) + eta2 - 9 * Math.pow(Math.tan(lat), 2) * eta2);
  var IX = Math.tan(lat) / (720 * rho * Math.pow(nu, 5)) * (61 + 90 * Math.pow(Math.tan(lat), 2) + 45 * Math.pow(Math.tan(lat), 4));
  var X = secLat / nu;
  var XI = secLat / (6 * Math.pow(nu, 3)) * (nu / rho + 2 * Math.pow(Math.tan(lat), 2));
  var XII = secLat / (120 * Math.pow(nu, 5)) * (5 + 28 * Math.pow(Math.tan(lat), 2) + 24 * Math.pow(Math.tan(lat), 4));
  var XIIA = secLat / (5040 * Math.pow(nu, 7)) * (61 + 662 * Math.pow(Math.tan(lat), 2) + 1320 * Math.pow(Math.tan(lat), 4) + 720 * Math.pow(Math.tan(lat), 6));
  var dE = E - E0;

  //These are on the wrong ellipsoid currently: Airy1830. (Denoted by _1)
  var lat_1 = lat - VII * Math.pow(dE, 2) + VIII * Math.pow(dE, 4) - IX * Math.pow(dE, 6);
  var lon_1 = lon0 + X * dE - XI * Math.pow(dE, 3) + XII * Math.pow(dE, 5) - XIIA * Math.pow(dE, 7);

  //Want to convert to the GRS80 ellipsoid.
  //First convert to cartesian from spherical polar coordinates
  var H = 0 //Third spherical coord.
  var x_1 = (nu / F0 + H) * Math.cos(lat_1) * Math.cos(lon_1);
  var y_1 = (nu / F0 + H) * Math.cos(lat_1) * Math.sin(lon_1);
  var z_1 = ((1 - e2) * nu / F0 + H) * Math.sin(lat_1);

  //Perform Helmut transform (to go between Airy 1830 (_1) and GRS80 (_2))
  var s = -20.4894 * Math.pow(10, -6); //The scale factor -1
  var tx = 446.448; //The translations along x,y,z axes respectively
  var ty = -125.157;
  var tz = 542.060;
  var rxs = 0.1502;
  var rys = 0.2470;
  var rzs = 0.8421; //The rotations along x,y,z respectively, in seconds
  var rx = rxs * Math.PI / (180 * 3600);
  var ry = rys * Math.PI / (180 * 3600);
  var rz = rzs * Math.PI / (180 * 3600); //In radians
  var x_2 = tx + (1 + s) * x_1 + (-rz) * y_1 + (ry) * z_1;
  var y_2 = ty + (rz) * x_1 + (1 + s) * y_1 + (-rx) * z_1;
  var z_2 = tz + (-ry) * x_1 + (rx) * y_1 + (1 + s) * z_1;

  //Back to spherical polar coordinates from cartesian
  //Need some of the characteristics of the new ellipsoid
  var a_2 = 6378137.000;
  var b_2 = 6356752.3141; //The GSR80 semi-major and semi-minor axes used for WGS84(m)
  var e2_2 = 1 - (b_2 * b_2) / (a_2 * a_2); //The eccentricity of the GRS80 ellipsoid
  var p = Math.sqrt(Math.pow(x_2, 2) + Math.pow(y_2, 2));

  //Lat is obtained by an iterative proceedure:
  var lat = Math.atan2(z_2, (p * (1 - e2_2))); //Initial value
  var latold = 2 * Math.PI;

  while (Math.abs(lat - latold) > Math.pow(10, -16)) {
    //console.log(Math.abs(lat - latold));
    var temp;
    var temp2;
    var nu_2;
    var temp1 = lat;
    var temp2 = latold;
    latold = temp1;
    lat = temp2;

    lat = latold;
    latold = lat;
    nu_2 = a_2 / Math.sqrt(1 - e2_2 * Math.pow(Math.sin(latold), 2));
    lat = Math.atan2(z_2 + e2_2 * nu_2 * Math.sin(latold), p);
  }
  //Lon and height are then pretty easy
  var lon = Math.atan2(y_2, x_2);
  var H = p / Math.cos(lat) - nu_2;

  //Convert to degrees
  lat = lat * 180 / Math.PI;
  lon = lon * 180 / Math.PI;

  return {
    lat: lat,
    lon: lon
  };
}


/*
  Convert Lat Lon to British national grid
  @param {Float} lat
  @param {Float} lon
  @return {Object} Easting, Northing
*/
Utils.LLtoNE = function(lat, lon) {
  var deg2rad = Math.PI / 180;
  var rad2deg = 180.0 / Math.PI;
  var phi = lat * deg2rad; // convert latitude to radians
  var lam = lon * deg2rad; // convert longitude to radians
  var a = 6377563.396; // OSGB semi-major axis
  var b = 6356256.91; // OSGB semi-minor axis
  var e0 = 400000; // OSGB easting of false origin
  var n0 = -100000; // OSGB northing of false origin
  var f0 = 0.9996012717; // OSGB scale factor on central meridian
  var e2 = 0.0066705397616; // OSGB eccentricity squared
  var lam0 = -0.034906585039886591; // OSGB false east
  var phi0 = 0.85521133347722145; // OSGB false north
  var af0 = a * f0;
  var bf0 = b * f0;
  // easting
  var slat2 = Math.sin(phi) * Math.sin(phi);
  var nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
  var rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
  var eta2 = (nu / rho) - 1;
  var p = lam - lam0;
  var IV = nu * Math.cos(phi);
  var clat3 = Math.pow(Math.cos(phi), 3);
  var tlat2 = Math.tan(phi) * Math.tan(phi);
  var V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
  var clat5 = Math.pow(Math.cos(phi), 5);
  var tlat4 = Math.pow(Math.tan(phi), 4);
  var VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
  var east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);
  // northing
  var n = (af0 - bf0) / (af0 + bf0);
  var M = Marc(bf0, n, phi0, phi);
  var I = M + (n0);
  var II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
  var III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
  var IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
  var north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);
  east = Math.round(east); // round to whole number
  north = Math.round(north); // round to whole number

  return {N: north, E: east}
}

function Marc(bf0, n, phi0, phi) {
  var Marc = bf0 * (((1 + n + ((5 / 4) * (n * n)) + ((5 / 4) * (n * n * n))) * (phi - phi0)) - (((3 * n) + (3 * (n * n)) + ((21 / 8) * (n * n * n))) * (Math.sin(phi - phi0)) * (Math.cos(phi + phi0))) + ((((15 / 8) * (n * n)) + ((15 / 8) * (n * n * n))) * (Math.sin(2 * (phi - phi0))) * (Math.cos(2 * (phi + phi0)))) - (((35 / 24) * (n * n * n)) * (Math.sin(3 * (phi - phi0))) * (Math.cos(3 * (phi + phi0)))));
  return (Marc);
}

/*
  generate transaction id
*/

Utils.generateTransactionId = function(ip){
  var md5 = crypto.createHash('md5');
          md5.update(ip + (new Date()).getTime());
  return md5.digest('hex');
}


/*
  common utils for response write http code and response
*/

Utils.handlerSequelizeException = function(res, ex){
  ex = ex || {};
  return res.json(500, {success: false, data: ex.toString(), msg: 'Exception thrown !!!'});
}

Utils.handlerUserInputException = function(res, ex){
  ex = ex || {};
  return res.json(400, {success: false, data: ex, msg: 'Please pass in right params'});
}

Utils.handlerNotFoundException = function(res, ex){
  ex = ex || {};
  return res.json(404, {success: false, data: ex, msg: 'Not Found !!!'});
}

Utils.handlerServerException =  function(res, ex){
  ex = ex || {};
  return res.json(500, {success: false, data: ex, msg: 'Exception thrown !!!'});
}

Utils.handleSuccess =  function(res, data){
  data = data || {};
  return res.json(200, {success: true, data: data});
}


/*
  Utils to send mail
  @param {string[]} emails
  @result {Object} success/failse
*/
Utils.sendMail = function(data, callback){
  // load aws config - TODO need fix config.json
  aws.config.loadFromPath('config.json');

  // load AWS SES
  var amzSES = new aws.SES({apiVersion: '2010-12-01'});

  var from = from || "dlites.support@gmail.com";

  amzSES.sendEmail({
    Source: from, 
    Destination: { ToAddresses: data.emails },
    Message: {
      Subject: {
        Data: data.header
      },
      Body: {
         Text: {
             Data: data.content,
         }
      }
    }
  },
  function(err, res) {
    if (err)
      callback({success: false, data: err});

    callback({success: true, data: res});
  });
}


// return utils
module.exports = Utils;