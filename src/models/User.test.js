const bcrypt = require('bcrypt')
const Sequelize = require('sequelize')
const UserFactory = require('./User')

describe('User Model', () => {
  it('should define users model', () => {
    const sequelize = {
      define: jest.fn(() => ({})),
    }
    const User = UserFactory({ sequelize })

    expect(sequelize.define.mock.calls.length).toBe(1)
    expect(sequelize.define).toBeCalledWith('Users', {
      name: Sequelize.STRING,
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
        },
      },
      password: Sequelize.STRING,
      accessLevel: Sequelize.STRING,
    })
  })
})
