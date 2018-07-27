const Sequelize = require('sequelize');

const sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: './database.sqlite',
});

const authenticate = () => sequelize.authenticate();

authenticate();

module.exports = sequelize;
