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

    expect(Wallet).toMatchSnapshot()
  })
})
