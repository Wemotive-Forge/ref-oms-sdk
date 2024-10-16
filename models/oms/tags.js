module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 pageTitle: {
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
});
return Tag;

};


