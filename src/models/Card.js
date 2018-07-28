const Decimal = require('decimal.js')
const Sequelize = require('sequelize')
const sequelize = require('../common/sequelize')

const CardFactory = ({ sequelize }) => {
  const Card = sequelize.define('Cards', {
    walletId: Sequelize.INTEGER,
    userId: Sequelize.INTEGER,
    number: Sequelize.STRING,
    bearer_name: Sequelize.STRING,
    cvv: Sequelize.STRING,
    validity: Sequelize.DATEONLY,
    limit: Sequelize.DECIMAL(12, 2),
    maturity: Sequelize.INTEGER,
  })

  Card.associate = function(models) {
    models.Card.belongsTo(models.Wallet)
    models.Card.belongsTo(models.User)
  }

  Card.register = async function({
    number,
    bearer_name,
    cvv,
    validity,
    limit,
    maturity,
    walletId,
    user,
    Wallet,
  }) {
    const wallet = await Wallet.findOne({ where: { id: walletId, userId: user.id } })
    const cardFound = await this.findOne({
      where: {
        number,
        walletId: wallet.id,
      },
    })

    if (cardFound) {
      throw { message: 'Card already registered' }
    }

    let transaction

    try {
      transaction = await sequelize.transaction()

      await Wallet.update(
        {
          limit: new Decimal(wallet.limit).plus(limit).toString(),
          available_limit: new Decimal(wallet.available_limit).plus(limit).toString(),
        },
        { where: { id: wallet.id, userId: user.id } },
        { transaction },
      )

      const card = await this.create(
        {
          number,
          bearer_name,
          cvv,
          validity,
          limit,
          maturity,
          walletId: wallet.id,
          userId: user.id,
        },
        { returning: true, transaction },
      )

      await transaction.commit()

      return card
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  return Card
}

const factory = (state = { sequelize }) => CardFactory(state)

module.exports = factory
