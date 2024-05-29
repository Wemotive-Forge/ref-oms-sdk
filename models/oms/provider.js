const {DataTypes} = require("sequelize");


module.exports = (sequelize, DataTypes) => {
    const Provider = sequelize.define('Provider', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV1,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

    }, {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    });

    Provider.associate = (models) => {
        Provider.belongsTo(models.Seller, { onDelete: 'CASCADE' });
        Provider.hasMany(models.Order, {  onDelete: 'CASCADE' });
    };

    return Provider;
};
