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
    create: async function({ data }) {
      const usersFound = await this.Model.findAll({
        where: {
          email: data.email,
        },
      })

      if (usersFound.length) {
        throw { message: 'User already registered' }
      }

      return await this.Model.create({
        ...data,
        password: await bcrypt.hash(data.password, 10),
        accessLevel: 'user',
      })
    },
  }
}

const factory = (state = { sequelize }) => UserFactory(state)

module.exports = factory
