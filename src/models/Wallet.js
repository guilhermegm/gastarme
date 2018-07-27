const Sequelize = require('sequelize')
const sequelize = require('../common/sequelize')

const WalletFactory = ({ sequelize }) => {
  const Model = sequelize.define('Wallets', {
    userId: Sequelize.INTEGER,
    limit: Sequelize.DECIMAL(12, 2),
    available_limit: Sequelize.DECIMAL(12, 2),
  })

  Model.associate = function(models) {
    models.Wallet.belongsTo(models.User)
  }

  return {
    Model,
    create: async function({ user }) {
      return await this.Model.create({
        userId: user.id,
        limit: 0,
        available_limit: 0,
      })
    },
  }
}

const factory = (state = { sequelize }) => WalletFactory(state)

module.exports = factory
