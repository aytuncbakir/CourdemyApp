const Sequelize = require('sequelize');
const config = require('../config/config');


const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    dialect: config.db.dialect,
    host: config.db.host,
    define: {
      timestamps: false,
    },
    storage: './session.mysql',
  }
);
async function connect() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL Database!');
  } catch (error) {
    console.log('Connection error!', error);
  }
}
connect();


module.exports = sequelize;