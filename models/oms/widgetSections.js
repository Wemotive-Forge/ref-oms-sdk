module.exports = (sequelize, DataTypes) => {
    const WidgetSection = sequelize.define('WidgetSection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING,
    allowNull:  true,
  },
  page: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  maxItems: {
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
return WidgetSection;

};


