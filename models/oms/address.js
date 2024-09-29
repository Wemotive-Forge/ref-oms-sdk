const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    door: DataTypes.STRING,
    building: DataTypes.STRING,
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    areaCode: DataTypes.STRING,
    tag: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,
    refId: {
      type: DataTypes.STRING,
      allowNull: true, // Optional field for flagging
    },
  });


  return Address;
};
