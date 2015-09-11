
module.exports = function(sequelize, DataTypes) {
  var Merchant_Groups = sequelize.define('Merchant_Groups', {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    charges: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  });
  return Merchant_Groups;
};
