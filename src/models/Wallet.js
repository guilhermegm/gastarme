const Decimal = require('decimal.js')
const moment = require('moment')
const Sequelize = require('sequelize')

const WalletFactory = ({ sequelize }) => {
  const Wallet = sequelize.define('Wallets', {
    userId: Sequelize.INTEGER,
    limit: Sequelize.DECIMAL(12, 2),
    available_limit: Sequelize.DECIMAL(12, 2),
  })

  Wallet.associate = function(models) {
    models.Wallet.belongsTo(models.User)
  }

  Wallet.delete = async function({ id, Card }) {
    let transaction

    try {
      transaction = await sequelize.transaction()

      await Card.destroy({ where: { walletId: id } }, { transaction })

      const deleteCount = await this.destroy(
        {
          where: {
            id,
          },
        },
        { transaction },
      )

      if (deleteCount === 0) {
        throw { message: 'Not found' }
      }

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  Wallet.buy = async function({ id, totalValue, user, Card }) {
    const wallet = await this.findById(id)

    if (wallet.userId !== user.id) {
      throw { message: 'Operation not permitted' }
    }

    const cards = await Card.findAll({
      where: {
        userId: user.id,
        walletId: wallet.id,
        validity: { [Sequelize.Op.gte]: moment().format('YYYY-MM-DD') },
      },
    })
    const cardsToUse = await this.getCardsToUse({ cards, totalValue })

    if (!cardsToUse.length) {
      throw { message: "You don't have enough funds to buy" }
    }

    const newAvailableLimit = await this.calculateNewAvailableLimit({ cardsToUse, wallet })

    let transaction

    try {
      transaction = await sequelize.transaction()

      cardsToUse.forEach(
        async cardToUse =>
          await Card.update(
            {
              limit: cardToUse.newValues.newCardLimit,
            },
            { where: { id: cardToUse.card.id, userId: user.id } },
            { transaction },
          ),
      )

      await this.update(
        { available_limit: newAvailableLimit },
        { where: { id: wallet.id, userId: user.id } },
        { transaction },
      )

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }

    return cardsToUse
  }

  Wallet.getDaysUntilMaturity = getDaysUntilMaturity
  Wallet.getCardsToUse = getCardsToUse
  Wallet.calculateNewAvailableLimit = calculateNewAvailableLimit

  return Wallet
}

module.exports = WalletFactory
