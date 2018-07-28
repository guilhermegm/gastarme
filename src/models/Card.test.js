const Decimal = require('decimal.js')
const Sequelize = require('sequelize')
const CardFactory = require('./Card')

describe('Card Model', () => {
  it('should define cards model', () => {
    const sequelize = {
      define: jest.fn(() => ({})),
    }
    const Card = CardFactory({ sequelize })

    expect(sequelize.define.mock.calls.length).toBe(1)
    expect(sequelize.define).toBeCalledWith('Cards', {
      walletId: Sequelize.INTEGER,
      userId: Sequelize.INTEGER,
      number: Sequelize.STRING,
      bearer_name: Sequelize.STRING,
      cvv: Sequelize.STRING,
      validity: Sequelize.DATEONLY,
      limit: Sequelize.DECIMAL(12, 2),
      maturity: Sequelize.INTEGER,
    })
  })

  it('should register a card', async () => {
    const CardModel = {
      create: jest.fn(() => Promise.resolve()),
      findOne: jest.fn(() => Promise.resolve()),
    }
    const transaction = {
      commit: jest.fn(() => Promise.resolve()),
    }
    const sequelize = {
      define: jest.fn(() => CardModel),
      transaction: jest.fn(() => transaction),
    }
    const Card = CardFactory({ sequelize })
    const wallet = { id: 55, limit: 0, available_limit: 0 }
    const Wallet = {
      findOne: jest.fn(() => Promise.resolve(wallet)),
      update: jest.fn(() => Promise.resolve()),
    }
    const user = { id: 111 }
    const card = {
      number: '123 4567 789',
      bearer_name: 'TEST NAME',
      cvv: '512',
      validity: '2018-07-27',
      limit: '1000.20',
      maturity: '2021-07-27',
      walletId: wallet.id,
    }

    await Card.register({
      ...card,
      user,
      Wallet,
    })

    expect(Wallet.findOne.mock.calls.length).toBe(1)
    expect(Wallet.findOne).toBeCalledWith({ where: { id: wallet.id, userId: user.id } })

    expect(CardModel.findOne.mock.calls.length).toBe(1)
    expect(CardModel.findOne).toBeCalledWith({
      where: {
        number: card.number,
        walletId: wallet.id,
      },
    })

    expect(CardModel.create.mock.calls.length).toBe(1)
    expect(CardModel.create).toBeCalledWith(
      {
        ...card,
        userId: user.id,
      },
      { returning: true, transaction },
    )

    expect(sequelize.transaction.mock.calls.length).toBe(1)
    expect(sequelize.transaction).toBeCalledWith()

    expect(Wallet.update.mock.calls.length).toBe(1)
    expect(Wallet.update).toBeCalledWith(
      {
        limit: new Decimal(wallet.limit).plus(card.limit).toString(),
        available_limit: new Decimal(wallet.available_limit).plus(card.limit).toString(),
      },
      { where: { id: wallet.id, userId: user.id } },
      { transaction },
    )

    expect(transaction.commit.mock.calls.length).toBe(1)
    expect(transaction.commit).toBeCalledWith()
  })

  it('should try to register and get card already registered', async () => {
    const CardModel = {
      findOne: jest.fn(() => Promise.resolve(1)),
    }
    const sequelize = {
      define: jest.fn(() => CardModel),
      transaction: jest.fn(),
    }
    const Card = CardFactory({ sequelize })
    const wallet = { id: 55, limit: 0, available_limit: 0 }
    const Wallet = {
      findOne: jest.fn(() => Promise.resolve(wallet)),
    }
    const user = { id: 111 }
    const card = {
      number: '123 4567 789',
      bearer_name: 'TEST NAME',
      cvv: '512',
      validity: '2018-07-27',
      limit: '1000.20',
      maturity: '2021-07-27',
      walletId: wallet.id,
    }

    try {
      await Card.register({
        ...card,
        user,
        Wallet,
      })
    } catch (error) {
      expect(Wallet.findOne.mock.calls.length).toBe(1)
      expect(Wallet.findOne).toBeCalledWith({ where: { id: wallet.id, userId: user.id } })

      expect(CardModel.findOne.mock.calls.length).toBe(1)
      expect(CardModel.findOne).toBeCalledWith({
        where: {
          number: card.number,
          walletId: wallet.id,
        },
      })

      expect(error).toEqual({ message: 'Card already registered' })
    }
  })

  it('should try to register a card and rollback', async () => {
    const CardModel = {
      create: jest.fn(() => Promise.reject()),
      findOne: jest.fn(() => Promise.resolve()),
    }
    const transaction = {
      rollback: jest.fn(() => Promise.resolve()),
    }
    const sequelize = {
      define: jest.fn(() => CardModel),
      transaction: jest.fn(() => transaction),
    }
    const Card = CardFactory({ sequelize })
    const wallet = { id: 55, limit: 0, available_limit: 0 }
    const Wallet = {
      findOne: jest.fn(() => Promise.resolve(wallet)),
      update: jest.fn(() => Promise.resolve()),
    }
    const user = { id: 111 }
    const card = {
      number: '123 4567 789',
      bearer_name: 'TEST NAME',
      cvv: '512',
      validity: '2018-07-27',
      limit: '1000.20',
      maturity: '2021-07-27',
      walletId: wallet.id,
    }

    try {
      await Card.register({
        ...card,
        user,
        Wallet,
      })
    } catch (error) {
      expect(Wallet.findOne.mock.calls.length).toBe(1)
      expect(Wallet.findOne).toBeCalledWith({ where: { id: wallet.id, userId: user.id } })

      expect(CardModel.findOne.mock.calls.length).toBe(1)
      expect(CardModel.findOne).toBeCalledWith({
        where: {
          number: card.number,
          walletId: wallet.id,
        },
      })

      expect(CardModel.create.mock.calls.length).toBe(1)
      expect(CardModel.create).toBeCalledWith(
        {
          ...card,
          userId: user.id,
        },
        { returning: true, transaction },
      )

      expect(sequelize.transaction.mock.calls.length).toBe(1)
      expect(sequelize.transaction).toBeCalledWith()

      expect(Wallet.update.mock.calls.length).toBe(1)
      expect(Wallet.update).toBeCalledWith(
        {
          limit: new Decimal(wallet.limit).plus(card.limit).toString(),
          available_limit: new Decimal(wallet.available_limit).plus(card.limit).toString(),
        },
        { where: { id: wallet.id, userId: user.id } },
        { transaction },
      )

      expect(transaction.rollback.mock.calls.length).toBe(1)
      expect(transaction.rollback).toBeCalledWith()
    }
  })
})
