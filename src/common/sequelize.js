const Sequelize = require('sequelize')

const sequelize = new Sequelize(
  process.env.GASTARME_DB_DATABASE || 'gastarme',
  process.env.GASTARME_DB_USERNAME || 'gastarme',
  process.env.GASTARME_DB_PASSWORD || 'gastarme',
  {
    host: process.env.GASTARME_DB_HOST || 'postgres',
    port: process.env.GASTARME_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
)

const authenticate = () => sequelize.authenticate()

authenticate()

module.exports = sequelize
