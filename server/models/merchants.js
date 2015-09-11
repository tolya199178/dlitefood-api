
module.exports = function(sequelize, DataTypes) {
  var Merchants = sequelize.define('Merchants', {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    charges: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    steps: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    min_order: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    opening_hours: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.INTEGER(11)
    },
    is_delivery: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    special_offer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
    },
    food: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    }
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Merchants.belongsTo(models.Users, {foreignKey: 'user_id'});
        Merchants.belongsTo(models.Merchant_Groups, {foreignKey: 'category'});
        Merchants.hasMany(models.Locations, {foreignKey: 'location_menu_id'});
      }
    }
  });
  return Merchants;
};
