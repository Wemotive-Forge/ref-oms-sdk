module.exports = (sequelize, DataTypes) => {
    const UserOrg = sequelize.define('UserOrg', {}, {
        freezeTableName: true,
        timestamps: false,
    });
    return UserOrg;
};