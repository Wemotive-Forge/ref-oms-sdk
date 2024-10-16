module.exports = (sequelize, DataTypes) => {
    const UserOfferUsage = sequelize.define('UserOfferUsage',{
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },
  orderId: {
    type: DataTypes.STRING, // Using FLOAT for better handling of decimal values, adjust if needed
  },
  userId: {
    type: DataTypes.STRING, // Using FLOAT for better handling of decimal values, adjust if needed
  },
},{
    freezeTableName: true,
    timestamps: true,
});

UserOfferUsage.associate = (models) => {
  UserOfferUsage.belongsTo(models.Offer, { onDelete: 'CASCADE' });
};

return UserOfferUsage;
};
