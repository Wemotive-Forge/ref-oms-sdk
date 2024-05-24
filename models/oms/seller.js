const {DataTypes} = require("sequelize");


module.exports = (sequelize, DataTypes) => {
    const Seller = sequelize.define('Seller', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV1,
        },
        gst: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pan: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bpp_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
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

    Seller.associate = (models) => {
        Seller.hasMany(models.Order);
        Seller.hasOne(models.SettlementDetails);
    };

    return Seller;
};
