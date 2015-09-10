'use strict';

var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
  var Staffs =  sequelize.define('Staffs', {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    postcode: {
      type: DataTypes.TEXT
    },
    max_distance: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING
    },
    available_time: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Staffs.belongsTo(models.Users, {foreignKey: 'user_id'});
      }
    }
  });
  
  return Staffs;
};