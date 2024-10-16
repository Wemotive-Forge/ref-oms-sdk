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
            allowNull: true,
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
        },
        alignTitle: {
            type: DataTypes.STRING,
        },
        left: {
            type: DataTypes.STRING,
        },
        backgroundColor: {
            type: DataTypes.STRING,
        },
        typeOfSection: {
            type: DataTypes.STRING,
        },
        imageHeight: {
            type: DataTypes.STRING,
        },
        imageWidth: {
            type: DataTypes.STRING,
        }

    }, {
        freezeTableName: true,
        timestamps: true,
    });
    return WidgetSection;

};


