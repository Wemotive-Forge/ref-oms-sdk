

module.exports = (sequelize, DataTypes) => {
    const Item = sequelize.define('Item', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV1,
        },
        itemId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fulfillmentId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.STRING,
            allowNull: false,
        }

    }, {
        freezeTableName: true,
        timestamps: true,
    });

    Item.associate = (models) => {
        Item.belongsTo(models.Order, {  onDelete: 'CASCADE' });
    };

    return Item;
};
