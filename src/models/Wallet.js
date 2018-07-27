const Sequelize = require('sequelize')
const sequelize = require('../common/sequelize')

const WalletFactory = ({ sequelize }) => {
  const Wallet = sequelize.define('Wallets', {
    userId: Sequelize.INTEGER,
    limit: Sequelize.DECIMAL(12, 2),
    available_limit: Sequelize.DECIMAL(12, 2),
  })

  Wallet.associate = function(models) {
    models.Wallet.belongsTo(models.User)
  }

  return Wallet
}

const factory = (state = { sequelize }) => WalletFactory(state)

module.exports = factory
