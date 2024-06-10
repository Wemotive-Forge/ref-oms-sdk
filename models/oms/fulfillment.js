

module.exports = (sequelize, DataTypes) => {
    const Fulfillment = sequelize.define('Fulfillment', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV1,
        },
        fulfillmentId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fulfillmentType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fulfillmentState: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        refund: {
            type: DataTypes.STRING,
        },
        details: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
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

    Fulfillment.associate = (models) => {
        Fulfillment.belongsTo(models.Order, {  onDelete: 'CASCADE' });
    };

    return Fulfillment;
};
