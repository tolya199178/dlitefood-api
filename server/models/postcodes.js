
module.exports = function(sequelize, DataTypes) {
  var Postcodes =  sequelize.define('Postcodes', { 
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    Postcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Latitude: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Longitude: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Easting: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Northing: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    GridRef: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    County: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    District: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Ward: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DistrictCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    WardCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CountryCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Constituency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Introduced: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Terminated1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Parish: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    NationalParks: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Population: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Households: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Builtuparea: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Builtupsubdivision: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Lowerlayersuperoutputarea: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
  return Postcodes;
};
