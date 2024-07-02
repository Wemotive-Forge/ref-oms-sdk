import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    // replication: {
    //     read: [
    //         {
    //             host: 'postgres-master', 
    //             port: process.env.DB_PORT,
    //             username: process.env.DB_USERNAME,
    //             password: process.env.DB_PASSWORD
    //         },
    //         {
    //             host: '172.31.0.3', // Replica host for reading
    //             port: 5433, // Replica database port
    //             username: 'postgres', // Replica database username
    //             password: 'Tirtha@4321' // Replica database password
    //         }
    //     ],
    //     write: {
    //         host: 'postgres-master', // Use master for writing
    //         port: process.env.DB_PORT,
    //         username: process.env.DB_USERNAME,
    //         password: process.env.DB_PASSWORD
    //     }
    // },
    operatorsAliases: 0,
    timezone: '+05:30',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    logging: true,
    pool: {
        "max": parseInt(process.env.DB_POOL_MAX, 10),
        "min": parseInt(process.env.DB_POOL_MIN, 10),
        "acquire": parseInt(process.env.DB_POOL_ACQUIRE, 10),
        "idle": parseInt(process.env.DB_POOL_IDLE, 10),
    },

});

let db = {}


fs.readdirSync(path.join(__dirname, 'oms'))
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(path.join(__dirname, 'oms'), file))(sequelize, Sequelize.DataTypes)
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});


sequelize
    .sync({alter: false})
    .then(() => console.log('Completed!'))


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
