

module.exports = function(sequelize, DataTypes) {
  var Items =  sequelize.define('Items', { 
    item_id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    merchant_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    item_meal: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_actual_price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_in_stock: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    item_subitem_price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_status: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Items.belongsTo(models.Categories, {foreignKey: 'category_id'});
        Items.belongsTo(models.Merchants, {foreignKey: 'merchant_id'});
      }
    }
  });
  
  return Items;
};
