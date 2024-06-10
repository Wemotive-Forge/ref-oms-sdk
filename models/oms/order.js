

module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV1,
        },
        orderId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        finalValue: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        bff: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        collectedBy: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        paymentStatus: {
            type: DataTypes.STRING,
        },
        state: {
            type: DataTypes.ENUM,
            values: ['Completed', 'Accepted', 'Cancelled', 'In-progress','Created'],
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
        },
        areaCode: {
            type: DataTypes.STRING,
        },
        domain: {
            type: DataTypes.STRING,
        },
        category: {
            type: DataTypes.STRING,
        },
        cancelledBy: {
            type: DataTypes.STRING,
        },
        cancelReasonCode: {
            type: DataTypes.STRING,
        },
        settlement: {
            type: DataTypes.JSONB,
        },
        // sellerId: {
        //     type: DataTypes.UUID,
        //     allowNull: false,
        // },
        // createdAt: {
        //     type: DataTypes.BIGINT,
        //     allowNull: false,
        //     defaultValue: sequelize.literal('extract(epoch from now()) * 1000'),
        // },
        // updatedAt: {
        //     type: DataTypes.BIGINT,
        //     allowNull: false,
        //     defaultValue: sequelize.literal('extract(epoch from now()) * 1000'),
        // },
    }, {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    });

    Order.associate = (models) => {
        Order.belongsTo(models.Seller, { onDelete: 'CASCADE' });
        Order.belongsTo(models.Provider, { onDelete: 'CASCADE' });
        Order.hasMany(models.Issue, { onDelete: 'CASCADE' });
        Order.hasMany(models.Return, {  onDelete: 'CASCADE' });
        Order.hasMany(models.Fulfillment, {  onDelete: 'CASCADE' });
        Order.hasMany(models.Item, {  onDelete: 'CASCADE' });
        Order.hasOne(models.SettlementDetails);
    };

    return Order;
};
