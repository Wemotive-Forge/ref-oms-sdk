module.exports = (sequelize, DataTypes) => {
    const Widget = sequelize.define('Widget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },
  page: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
  },
  params: {
    type: DataTypes.JSONB,
  },
  cta: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  serviceability: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  allowRedirection: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  validFrom: {
    type: DataTypes.BIGINT,
  },
  validTo: {
    type: DataTypes.BIGINT,
  },
  image: {
    type: DataTypes.STRING,
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
return Widget;

};


