

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Categories', { 
    category_id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    type_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_detail: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category_order: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_status: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
};
