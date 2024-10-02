module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define('Offer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  offerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  autoApply: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  additive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  validFrom: {
    type: DataTypes.DATE,
  },
  validTo: {
    type: DataTypes.DATE,
  },
  items: {
    type: DataTypes.JSONB,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Assuming the images are an array of strings
  },
  totalQty: {
    type: DataTypes.INTEGER,
  },
  createdBy: {
    type: DataTypes.STRING,
  },
  updatedBy: {
    type: DataTypes.STRING,
  }
},{
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});
return Offer;

};


