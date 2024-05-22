const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
    const Pin = sequelize.define('Pin', {
            type: {
                type: DataTypes.STRING,
                allowNull: false
            },
            otp: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            TourId: {
                type: DataTypes.UUID,
                allowNull: false
            },
        },
        {
            freezeTableName: true,
        });

    Pin.hashPin = async function (pin) {
        if (!pin.changed('pin')) return;

        bcrypt.hash(pin.getDataValue('pin'), 10, (err, hash) => {
            if (err) {
                throw err
            } else {
                pin.setDataValue('pin', hash);
                return hash
            }
        });

    };

    Pin.beforeCreate(Pin.hashPin);
    Pin.beforeUpdate(Pin.hashPin);

    return Pin;
};
