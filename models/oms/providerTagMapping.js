module.exports = (sequelize, DataTypes) => {
    const ProviderTagMapping = sequelize.define('ProviderTagMapping', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true,
    allowNull: false,
  },
  providerId:{
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
    ProviderTagMapping.associate = function (models) {
        ProviderTagMapping.belongsTo(models.Tag);
    };

return ProviderTagMapping;

};


