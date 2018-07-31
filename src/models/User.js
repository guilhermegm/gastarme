const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const sequelize = require('../common/sequelize')

const UserFactory = ({ sequelize }) => {
  const Model = sequelize.define('Users', {
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

  return {
    Model,
    create: async function({ name, email, password }) {
      const usersFound = await this.Model.findAll({
        where: {
          email: email,
        },
      })

      if (usersFound.length) {
        throw { message: 'User already registered' }
      }

      return await this.Model.create({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        accessLevel: 'user',
      })
    },
  }
}

const factory = (state = { sequelize }) => UserFactory(state)

module.exports = factory
