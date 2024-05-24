module.exports = (sequelize, DataTypes) => {
    const SettlementDetails = sequelize.define('SettlementDetails', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV1,
        },
        settlementType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bankName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        branchName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        UPI: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        settlement_bank_account_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        beneficiary_name: {
            type: DataTypes.STRING,
            allowNull: true,
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

    SettlementDetails.associate = (models) => {
        SettlementDetails.belongsTo(models.Seller);
    };

    return SettlementDetails;
};
