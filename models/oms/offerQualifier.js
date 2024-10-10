module.exports = (sequelize, DataTypes) => {
    const OfferQualifier = sequelize.define('OfferQualifier',{
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },
  minValue: {
    type: DataTypes.FLOAT, // Using FLOAT for better handling of decimal values, adjust if needed
  },
  itemCount: {
    type: DataTypes.INTEGER,
  },
  maxUsagePerUser: {
    type: DataTypes.INTEGER,
  },
  usageDurationInDays: {
    type: DataTypes.INTEGER,
  },
  usageFrequency: {
    type: DataTypes.STRING,
  },
},{
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});

OfferQualifier.associate = (models) => {
    OfferQualifier.belongsTo(models.Offer, { onDelete: 'CASCADE' });
};

return OfferQualifier;
};
