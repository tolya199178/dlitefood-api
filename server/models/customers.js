'use strict';
var md5       = require('md5' ),
    Promise   = require('bluebird');

module.exports = function(sequelize, DataTypes) {
  var Customers = sequelize.define('Customers', {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    screen_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address1: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'non-active'
    },
    co_user: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    co_company_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    co_job_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    co_total_employees: {
      type: DataTypes.STRING,
      allowNull: true
    },
    co_pay_method: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }

  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Customers.belongsTo(models.Users, {foreignKey: 'user_id'});
      }
    }
  });
  return Customers;
};
