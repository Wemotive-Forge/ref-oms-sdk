
module.exports = (sequelize, DataTypes) => {
    const Issue = sequelize.define('Issue', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV1,
        },
        issueId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subCategory: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        issueStatus: {
            type: DataTypes.STRING,
            allowNull: false,
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

    Issue.associate = (models) => {
        Issue.belongsTo(models.Order, {  onDelete: 'CASCADE' });
    };

    return Issue;
};

