const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV1,
        },
        // username: {
        //   type: DataTypes.STRING,
        //   unique: true,
        //   allowNull: false,
        //   validate: {
        //     notEmpty: true
        //   }
        // },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        mobile: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        whatsAppNo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // address
        street1: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        street2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        PIN: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isSystemGeneratedPassword: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        accountExpired: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        accountLocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        passwordExpired: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        lastLoginAt: {
            type: DataTypes.BIGINT
        },
        profilePic: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
    });

    User.prototype.isPasswordValid = function (password) {
        const user = this;
        return new Promise((resolve, reject) => {
            if (!user.password) {
                const err = new Error('Password not set');
                err.name = 'InvalidPasswordError';
                reject(err);
            }
            bcrypt.compare(password, user.password).then((match) => {
                if (!match) {
                    const err = new Error('Invalid current password');
                    err.name = 'InvalidPasswordError';
                    reject(err);
                }
                resolve(match);
            });
        });
    };

    User.prototype.authenticate = function (password) {
        const user = this;
        return new Promise((resolve, reject) => {
            user.isPasswordValid(password).then(() => resolve(true)).catch((err) => reject(err));
        });
    };

    User.prototype.toJSON = function () {
        const values = {...this.get()};
        delete values.password;
        return values;
    };

    User.hashPassword = function (user) {
        return new Promise((resolve, reject) => {
            if (!user.changed('password')) return resolve();
            bcrypt.hash(user.getDataValue('password'), 10, (err, hash) => {
                if (err) reject(err);
                else {
                    user.setDataValue('password', hash);
                    resolve(hash);
                }
            });
        });
    };

    User.beforeCreate(User.hashPassword);
    User.beforeUpdate(User.hashPassword);

    User.associate = function (models) {
        User.belongsToMany(models.Role, {through: 'UserRole'});
    };

    return User;
};
