const Sequelize = require('sequelize')

const CardFactory = ({ sequelize }) => {
  const Model = sequelize.define('Cards', {
    walletId: Sequelize.INTEGER,
    number: Sequelize.STRING,
    bearer_name: Sequelize.STRING,
    cvv: Sequelize.STRING,
    validity: Sequelize.DATEONLY,
    limit: Sequelize.DATEONLY,
    maturity: Sequelize.INTEGER,
  })

  Model.associate = function(models) {
    models.Card.belongsTo(models.Wallet)
  }

  return {
    Model,
  }
}

module.exports = CardFactory
