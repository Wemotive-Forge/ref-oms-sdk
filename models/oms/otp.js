const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
    const Otp = sequelize.define('Otp', {
            mobile: {
                type: DataTypes.STRING,
                allowNull: false
            },
            otp: {
                type: DataTypes.STRING,
                allowNull: false,
                index: {expires: 300} // 300 seconds
            },
            expiry: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            freezeTableName: true,
            timestamps: false,
        });

    Otp.hashOtp = async function (otp) {
        if (!otp.changed('otp')) return;

        bcrypt.hash(otp.getDataValue('otp'), 10, (err, hash) => {
            if (err) {
                throw err
            } else {
                otp.setDataValue('otp', hash);
                return hash
            }
        });

    };

    Otp.beforeCreate(Otp.hashOtp);
    Otp.beforeUpdate(Otp.hashOtp);

    return Otp;
};
