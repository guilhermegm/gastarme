const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const sequelize = require('../common/sequelize')

const UserFactory = ({ sequelize }) => {
  const User = sequelize.define('Users', {
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

  return User
}

const factory = (state = { sequelize }) => UserFactory(state)

module.exports = factory
