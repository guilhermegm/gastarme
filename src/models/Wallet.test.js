const moment = require('moment')
const Sequelize = require('sequelize')
const WalletFactory = require('./Wallet')

describe('Wallet Model', () => {
  it('should define wallets model', () => {
    const sequelize = {
      define: jest.fn(() => ({})),
    }
    const Wallet = WalletFactory({ sequelize })

    expect(sequelize.define.mock.calls.length).toBe(1)
    expect(sequelize.define).toBeCalledWith('Wallets', {
      userId: Sequelize.INTEGER,
      limit: Sequelize.DECIMAL(12, 2),
      available_limit: Sequelize.DECIMAL(12, 2),
    })
  })

  it('should delete a wallet', async () => {
    const WalletModel = {
      destroy: jest.fn(() => Promise.resolve()),
    }
    const transaction = {
      commit: jest.fn(() => Promise.resolve()),
    }
    const sequelize = {
      define: jest.fn(() => WalletModel),
      transaction: jest.fn(() => Promise.resolve(transaction)),
    }
    const Wallet = WalletFactory({ sequelize })
    const Card = {
      destroy: jest.fn(() => Promise.resolve()),
    }
    const walletId = 37

    await Wallet.delete({ id: walletId, Card })

    expect(sequelize.transaction.mock.calls.length).toBe(1)
    expect(sequelize.transaction).toBeCalledWith()

    expect(Card.destroy.mock.calls.length).toBe(1)
    expect(Card.destroy).toBeCalledWith({ where: { walletId } }, { transaction })

    expect(WalletModel.destroy.mock.calls.length).toBe(1)
    expect(WalletModel.destroy).toBeCalledWith(
      {
        where: {
          id: walletId,
        },
      },
      { transaction },
    )

    expect(transaction.commit.mock.calls.length).toBe(1)
    expect(transaction.commit).toBeCalledWith()
  })

  it('should try to delete a wallet and rollback', async () => {
    const WalletModel = {
      destroy: jest.fn(() => Promise.reject()),
    }
    const transaction = {
      rollback: jest.fn(() => Promise.resolve()),
    }
    const sequelize = {
      define: jest.fn(() => WalletModel),
      transaction: jest.fn(() => Promise.resolve(transaction)),
    }
    const Wallet = WalletFactory({ sequelize })
    const Card = {
      destroy: jest.fn(() => Promise.resolve()),
    }
    const walletId = 37

    try {
      await Wallet.delete({ id: walletId, Card })
    } catch (error) {
      expect(sequelize.transaction.mock.calls.length).toBe(1)
      expect(sequelize.transaction).toBeCalledWith()

      expect(Card.destroy.mock.calls.length).toBe(1)
      expect(Card.destroy).toBeCalledWith({ where: { walletId } }, { transaction })

      expect(WalletModel.destroy.mock.calls.length).toBe(1)
      expect(WalletModel.destroy).toBeCalledWith(
        {
          where: {
            id: walletId,
          },
        },
        { transaction },
      )

      expect(transaction.rollback.mock.calls.length).toBe(1)
      expect(transaction.rollback).toBeCalledWith()
    }
  })

  it('should delete a wallet', async () => {
    const WalletModel = {
      destroy: jest.fn(() => Promise.resolve()),
    }
    const transaction = {
      commit: jest.fn(() => Promise.resolve()),
    }
    const sequelize = {
      define: jest.fn(() => WalletModel),
      transaction: jest.fn(() => Promise.resolve(transaction)),
    }
    const Wallet = WalletFactory({ sequelize })
    const Card = {
      delete: jest.fn(() => Promise.resolve()),
    }
    const walletId = 37

    await Wallet.delete({ id: walletId, Card })

    expect(sequelize.transaction.mock.calls.length).toBe(1)
    expect(sequelize.transaction).toBeCalledWith()

    expect(Card.delete.mock.calls.length).toBe(1)
    expect(Card.delete).toBeCalledWith({ walletId, transaction })

    expect(WalletModel.destroy.mock.calls.length).toBe(1)
    expect(WalletModel.destroy).toBeCalledWith(
      {
        where: {
          id: walletId,
        },
      },
      { transaction },
    )

    expect(transaction.commit.mock.calls.length).toBe(1)
    expect(transaction.commit).toBeCalledWith()
  })

  it('should try to delete a wallet and rollback', async () => {
    const WalletModel = {
      destroy: jest.fn(() => Promise.reject()),
    }
    const transaction = {
      rollback: jest.fn(() => Promise.resolve()),
    }
    const sequelize = {
      define: jest.fn(() => WalletModel),
      transaction: jest.fn(() => Promise.resolve(transaction)),
    }
    const Wallet = WalletFactory({ sequelize })
    const Card = {
      delete: jest.fn(() => Promise.resolve()),
    }
    const walletId = 37

    try {
      await Wallet.delete({ id: walletId, Card })
    } catch (error) {
      expect(sequelize.transaction.mock.calls.length).toBe(1)
      expect(sequelize.transaction).toBeCalledWith()

      expect(Card.delete.mock.calls.length).toBe(1)
      expect(Card.delete).toBeCalledWith({ walletId, transaction })

      expect(WalletModel.destroy.mock.calls.length).toBe(1)
      expect(WalletModel.destroy).toBeCalledWith(
        {
          where: {
            id: walletId,
          },
        },
        { transaction },
      )

      expect(transaction.rollback.mock.calls.length).toBe(1)
      expect(transaction.rollback).toBeCalledWith()
    }
  })

  it('should buy using a wallet', async () => {
    const wallet = { id: 3, available_limit: '799.99', userId: 111 }
    const cards = [
      {
        id: 38,
        limit: 1000,
        maturity: 3,
      },
      {
        id: 39,
        limit: 700,
        maturity: 2,
      },
    ]
    const cardsToUse = [
      {
        card: {
          id: 77,
        },
        newValues: {
          newCardLimit: '300.30',
        },
      },
      {
        card: {
          id: 11,
        },
        newValues: {
          newCardLimit: '321.12',
        },
      },
    ]
    const newAvailableLimit = '75040.15'
    const user = { id: 111 }
    const walletId = 5
    const totalValue = '1300.25'
    const Card = {
      findAll: jest.fn(() => Promise.resolve(cards)),
      update: jest.fn(() => Promise.resolve()),
    }
    const transaction = {
      commit: jest.fn(() => Promise.resolve()),
    }
    const WalletModel = {
      findById: jest.fn(() => Promise.resolve(wallet)),
      update: jest.fn(() => Promise.resolve()),
    }
    const sequelize = {
      define: jest.fn(() => WalletModel),
      transaction: jest.fn(() => transaction),
    }
    const Wallet = {
      ...WalletFactory({ sequelize }),
      calculateNewAvailableLimit: jest.fn(() => Promise.resolve(newAvailableLimit)),
      getCardsToUse: jest.fn(() => Promise.resolve(cardsToUse)),
    }

    await Wallet.buy({ id: walletId, totalValue, user, Card })

    expect(WalletModel.findById.mock.calls.length).toBe(1)
    expect(WalletModel.findById).toBeCalledWith(walletId)

    expect(Card.findAll.mock.calls.length).toBe(1)
    expect(Card.findAll).toBeCalledWith({
      where: {
        userId: user.id,
        walletId: wallet.id,
        validity: { [Sequelize.Op.gte]: moment().format('YYYY-MM-DD') },
      },
    })

    expect(Wallet.getCardsToUse.mock.calls.length).toBe(1)
    expect(Wallet.getCardsToUse).toBeCalledWith({ cards, totalValue })

    expect(Wallet.calculateNewAvailableLimit.mock.calls.length).toBe(1)
    expect(Wallet.calculateNewAvailableLimit).toBeCalledWith({ cardsToUse, wallet })

    expect(sequelize.transaction.mock.calls.length).toBe(1)
    expect(sequelize.transaction).toBeCalledWith()

    expect(Card.update.mock.calls.length).toBe(2)
    cardsToUse.forEach(cardToUse => {
      expect(Card.update).toBeCalledWith(
        {
          limit: cardToUse.newValues.newCardLimit,
        },
        { where: { id: cardToUse.card.id, userId: user.id } },
        { transaction },
      )
    })

    expect(Wallet.update.mock.calls.length).toBe(1)
    expect(Wallet.update).toBeCalledWith(
      { available_limit: newAvailableLimit },
      { where: { id: wallet.id, userId: user.id } },
      { transaction },
    )

    expect(transaction.commit.mock.calls.length).toBe(1)
    expect(transaction.commit).toBeCalledWith()
  })

  it('should try to buy and get operation not permitted', async () => {
    const wallet = { id: 3, available_limit: '799.99', userId: 112 }
    const cards = [
      {
        id: 38,
        limit: 1000,
        maturity: 3,
      },
      {
        id: 39,
        limit: 700,
        maturity: 2,
      },
    ]
    const user = { id: 111 }
    const walletId = 5
    const totalValue = '1300.25'
    const Card = {}
    const WalletModel = {
      findById: jest.fn(() => Promise.resolve(wallet)),
    }
    const sequelize = {
      define: jest.fn(() => WalletModel),
    }
    const Wallet = WalletFactory({ sequelize })

    try {
      await Wallet.buy({ id: walletId, totalValue, user, Card })
    } catch (error) {
      expect(WalletModel.findById.mock.calls.length).toBe(1)
      expect(WalletModel.findById).toBeCalledWith(walletId)

      expect(error).toEqual({ message: 'Operation not permitted' })
    }
  })

  it('should try to buy and get you dont have enough funds to buy', async () => {
    const wallet = { id: 3, available_limit: '799.99', userId: 111 }
    const cards = []
    const cardsToUse = []
    const user = { id: 111 }
    const walletId = 5
    const totalValue = '1300.25'
    const Card = {
      findAll: jest.fn(() => Promise.resolve(cards)),
    }
    const WalletModel = {
      findById: jest.fn(() => Promise.resolve(wallet)),
    }
    const sequelize = {
      define: jest.fn(() => WalletModel),
    }
    const Wallet = {
      ...WalletFactory({ sequelize }),
      getCardsToUse: jest.fn(() => Promise.resolve(cardsToUse)),
    }

    try {
      await Wallet.buy({ id: walletId, totalValue, user, Card })
    } catch (error) {
      expect(WalletModel.findById.mock.calls.length).toBe(1)
      expect(WalletModel.findById).toBeCalledWith(walletId)

      expect(Card.findAll.mock.calls.length).toBe(1)
      expect(Card.findAll).toBeCalledWith({
        where: {
          userId: user.id,
          walletId: wallet.id,
          validity: { [Sequelize.Op.gte]: moment().format('YYYY-MM-DD') },
        },
      })

      expect(Wallet.getCardsToUse.mock.calls.length).toBe(1)
      expect(Wallet.getCardsToUse).toBeCalledWith({ cards, totalValue })

      expect(error).toEqual({ message: "You don't have enough funds to buy" })
    }
  })

  it('should try to buy and rollback', async () => {
    const wallet = { id: 3, available_limit: '799.99', userId: 111 }
    const cards = [
      {
        id: 38,
        limit: 1000,
        maturity: 3,
      },
      {
        id: 39,
        limit: 700,
        maturity: 2,
      },
    ]
    const cardsToUse = [
      {
        card: {
          id: 77,
        },
        newValues: {
          newCardLimit: '300.30',
        },
      },
      {
        card: {
          id: 11,
        },
        newValues: {
          newCardLimit: '321.12',
        },
      },
    ]
    const newAvailableLimit = '75040.15'
    const user = { id: 111 }
    const walletId = 5
    const totalValue = '1300.25'
    const Card = {
      findAll: jest.fn(() => Promise.resolve(cards)),
      update: jest.fn(() => Promise.resolve()),
    }
    const transaction = {
      rollback: jest.fn(() => Promise.resolve()),
    }
    const WalletModel = {
      findById: jest.fn(() => Promise.resolve(wallet)),
      update: jest.fn(() => Promise.reject()),
    }
    const sequelize = {
      define: jest.fn(() => WalletModel),
      transaction: jest.fn(() => transaction),
    }
    const Wallet = {
      ...WalletFactory({ sequelize }),
      calculateNewAvailableLimit: jest.fn(() => Promise.resolve(newAvailableLimit)),
      getCardsToUse: jest.fn(() => Promise.resolve(cardsToUse)),
    }

    try {
      await Wallet.buy({ id: walletId, totalValue, user, Card })
    } catch (error) {
      expect(WalletModel.findById.mock.calls.length).toBe(1)
      expect(WalletModel.findById).toBeCalledWith(walletId)

      expect(Card.findAll.mock.calls.length).toBe(1)
      expect(Card.findAll).toBeCalledWith({
        where: {
          userId: user.id,
          walletId: wallet.id,
          validity: { [Sequelize.Op.gte]: moment().format('YYYY-MM-DD') },
        },
      })

      expect(Wallet.getCardsToUse.mock.calls.length).toBe(1)
      expect(Wallet.getCardsToUse).toBeCalledWith({ cards, totalValue })

      expect(Wallet.calculateNewAvailableLimit.mock.calls.length).toBe(1)
      expect(Wallet.calculateNewAvailableLimit).toBeCalledWith({ cardsToUse, wallet })

      expect(sequelize.transaction.mock.calls.length).toBe(1)
      expect(sequelize.transaction).toBeCalledWith()

      expect(Card.update.mock.calls.length).toBe(2)
      cardsToUse.forEach(cardToUse => {
        expect(Card.update).toBeCalledWith(
          {
            limit: cardToUse.newValues.newCardLimit,
          },
          { where: { id: cardToUse.card.id, userId: user.id } },
          { transaction },
        )
      })

      expect(Wallet.update.mock.calls.length).toBe(1)
      expect(Wallet.update).toBeCalledWith(
        { available_limit: newAvailableLimit },
        { where: { id: wallet.id, userId: user.id } },
        { transaction },
      )

      expect(transaction.rollback.mock.calls.length).toBe(1)
      expect(transaction.rollback).toBeCalledWith()
    }
  })

  it('should get days until maturity', async () => {
    const maturity = 25
    const sequelize = {
      define: jest.fn(() => ({})),
    }
    const Wallet = WalletFactory({ sequelize })

    const daysUntilMaturity = await Wallet.getDaysUntilMaturity({
      maturity,
      momentNow: moment('2018-07-29'),
    })

    expect(daysUntilMaturity).toBe(27)
  })

  it('should get cards to use', async () => {
    const cards = [
      {
        id: 93,
        limit: 12300,
        maturity: 13,
      },
      {
        id: 71,
        limit: 10420,
        maturity: 15,
      },
    ]
    const totalValue = '8239.95'
    const sequelize = {
      define: jest.fn(() => ({})),
    }
    const Wallet = WalletFactory({ sequelize })

    const cardsToUse = await Wallet.getCardsToUse({ cards, totalValue })

    expect(cardsToUse).toEqual([
      {
        card: { id: 71, limit: 10420, maturity: 15 },
        newValues: { newCardLimit: '2180.05', value: '8239.95' },
      },
    ])
  })

  it('should calculate new available limit', async () => {
    const wallet = {
      available_limit: 9999.91,
    }
    const cardsToUse = [
      {
        card: { id: 31, limit: 1230.43, maturity: 12 },
        newValues: { newCardLimit: '2180.05', value: '8239.95' },
      },
    ]
    const sequelize = {
      define: jest.fn(() => ({})),
    }
    const Wallet = WalletFactory({ sequelize })

    const newAvailableLimit = await Wallet.calculateNewAvailableLimit({ cardsToUse, wallet })

    expect(newAvailableLimit).toBe('1759.96')
  })
})
