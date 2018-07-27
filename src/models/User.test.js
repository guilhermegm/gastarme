const bcrypt = require('bcrypt')
const Sequelize = require('sequelize')
const UserFactory = require('./User')

describe('User Model', () => {
  it('should create an user properly', () => {
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

    expect(User).toMatchSnapshot()
  })

  describe('create', () => {
    it('should call properly', async () => {
      const usersFound = []
      const UserModel = {
        findAll: jest.fn(() => Promise.resolve(usersFound)),
        create: jest.fn(() => Promise.resolve()),
      }
      const sequelize = {
        define: jest.fn(() => UserModel),
      }
      const User = UserFactory({ sequelize })
      const data = {
        name: 'Test',
        password: 'abc',
        email: 'email@email.co',
      }

      await User.create({ data })

      expect(UserModel.findAll.mock.calls.length).toBe(1)
      expect(UserModel.findAll).toBeCalledWith({
        where: {
          email: data.email,
        },
      })

      expect(UserModel.create.mock.calls.length).toBe(1)
      expect(UserModel.create).toBeCalledWith({
        ...data,
        password: UserModel.create.mock.calls[0][0].password,
        accessLevel: 'user',
      })
    })

    it('should throw an error when users are found', async () => {
      const usersFound = [1]
      const UserModel = {
        findAll: jest.fn(() => Promise.resolve(usersFound)),
      }
      const sequelize = {
        define: jest.fn(() => UserModel),
      }
      const User = UserFactory({ sequelize })
      const data = {
        email: 'email@email.co',
      }

      try {
        await User.create({ data })
      } catch (error) {
        expect(error).toEqual({ message: 'User already registered' })
      }
    })
  })
})
