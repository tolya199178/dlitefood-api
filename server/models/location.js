
module.exports = function(sequelize, DataTypes) {
  var Locations =  sequelize.define('Locations', {
    location_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    location_city: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location_postcode: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location_menu_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    location_status: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },{
    timestamps: false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Locations.belongsTo(models.Merchants, {foreignKey: 'location_menu_id', targetKey: 'id'});
      }
    }
  });

  return Locations;
};
