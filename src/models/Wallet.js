const Sequelize = require('sequelize')

const WalletFactory = ({ sequelize }) => {
  const Wallet = sequelize.define('Wallets', {
    limit: Sequelize.DECIMAL(12, 2),
    available_limit: Sequelize.DECIMAL(12, 2),
  })

  Wallet.belongsTo(User)

  return Wallet
}

module.exports = WalletFactory
