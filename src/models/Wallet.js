const Decimal = require('decimal.js')
const moment = require('moment')
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

const getDaysUntilMaturity = ({ maturity, momentNow = moment() }) => {
  const today = momentNow
    .clone()
    .hours(0)
    .minutes(0)
    .seconds(0)
  const maturityDate = momentNow
    .clone()
    .date(maturity)
    .hours(0)
    .minutes(0)
    .seconds(0)

  if (today.date() > maturity) {
    maturityDate.add(1, 'month')
  }

  return maturityDate.diff(today, 'days')
}

async function getCardsToUse({ cards, totalValue }) {
  let remainingValue = new Decimal(totalValue)

  const sortByLimit = (prev, next) => (+prev.limit > +next.limit ? 1 : 0)
  const sortByDaysUntilMaturity = (prev, next) => {
    const prevDaysUntilMaturity = this.getDaysUntilMaturity({ maturity: prev.maturity })
    const nextDaysUntilMaturity = this.getDaysUntilMaturity({ maturity: next.maturity })

    return prevDaysUntilMaturity < nextDaysUntilMaturity ? 1 : 0
  }
  const filterCardsWithNewValues = (cardsWithNewValues, card) => {
    if (+remainingValue && +card.limit) {
      let value = 0

      if (+remainingValue > +card.limit) {
        value = card.limit
        remainingValue = remainingValue.minus(card.limit)
      } else {
        value = remainingValue
        remainingValue = '0.00'
      }

      cardsWithNewValues.push({
        card,
        newValues: {
          newCardLimit: new Decimal(card.limit).minus(value).toString(),
          value: value.toString(),
        },
      })
    }

    return cardsWithNewValues
  }

  const cardsWithNewValues = cards
    .sort(sortByLimit)
    .sort(sortByDaysUntilMaturity)
    .reduce(filterCardsWithNewValues, [])

  return +remainingValue ? [] : cardsWithNewValues
}

const calculateNewAvailableLimit = ({ cardsToUse, wallet }) =>
  cardsToUse
    .reduce(
      (newAvailableLimit, cardToUse) => newAvailableLimit.minus(cardToUse.newValues.value),
      new Decimal(wallet.available_limit),
    )
    .toString()

const factory = (state = { sequelize }) => WalletFactory(state)

module.exports = factory
