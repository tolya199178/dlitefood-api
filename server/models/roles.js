

module.exports = function(sequelize, DataTypes) {
  var Role =  sequelize.define('Roles', {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    timestamps: false
  });
  return Role;
};
