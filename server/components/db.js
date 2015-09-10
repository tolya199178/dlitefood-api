var Sequelize   = require('sequelize');
var config      = require('../config/environment');
// Connect to MySQL using Sequelize database

var db = module.exports = function () {
  var sequelize = new Sequelize(
    config.mysql.database,
    config.mysql.user,
    config.mysql.password,
    {
      host: config.mysql.host,
      dialect: 'mysql',
      pool: {
        max: 100,
        min: 0,
        idle: 10000
      },
      logging: console.log
    });
  return sequelize;
};
