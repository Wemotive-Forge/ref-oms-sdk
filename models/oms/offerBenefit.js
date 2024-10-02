module.exports = (sequelize, DataTypes) => {
    const OfferBenefit = sequelize.define('OfferBenefit',{
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },
  valueType: {
    type: DataTypes.STRING,
  },
  value: {
    type: DataTypes.FLOAT, // Using FLOAT for better handling of decimal values, adjust if needed
  },
  valueCap: {
    type: DataTypes.FLOAT, // Same reasoning as `value`
  },
  itemCount: {
    type: DataTypes.INTEGER,
  },
  item: {
    type: DataTypes.JSONB, // Storing as JSONB, adjust if item structure is known
  },
  itemValue: {
    type: DataTypes.FLOAT,
  }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});

OfferBenefit.associate = (models) => {
    OfferBenefit.belongsTo(models.Offer, { onDelete: 'CASCADE' });
};

return OfferBenefit;
};