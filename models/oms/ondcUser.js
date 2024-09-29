const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const OndcUser = sequelize.define('OndcUser', {
    uid: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });


  return OndcUser;
};
