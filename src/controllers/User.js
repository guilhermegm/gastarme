const bcrypt = require('bcrypt')
const express = require('express')
const Joi = require('joi')
const jwt = require('../common/jwt')

const createSchema = Joi.object().keys({
  name: Joi.string()
    .alphanum()
    .required(),
  password: Joi.string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  email: Joi.string()
    .email()
    .required(),
})

const loginSchema = Joi.object().keys({
  password: Joi.string()
    .regex(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  email: Joi.string()
    .email()
    .required(),
})

const UserControllerFactory = ({ User }) => {
  const router = express.Router()

  router.post('/users', async (req, res, next) => {
    try {
      const createData = await Joi.validate(req.body, createSchema)
      const userFound = await User.findOne({ where: { email: createData.email } })

      if (userFound) {
        throw { message: 'User already registered' }
      }

      const user = await User.create(
        {
          ...createData,
          password: await bcrypt.hash(createData.password, 10),
          accessLevel: 'user',
        },
        { returning: true },
      )

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        accessLevel: user.accessLevel,
        createdAt: user.createdAt,
      })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/users/login', async (req, res, next) => {
    try {
      const loginData = await Joi.validate(req.body, loginSchema)

      const userFound = await User.findOne({
        where: {
          email: loginData.email,
        },
      })

      if (!userFound) {
        throw { message: 'The email or password is not correctly' }
      }

      const isPasswordCorrect = await bcrypt.compare(loginData.password, userFound.password)

      if (!isPasswordCorrect) {
        throw { message: 'The email or password is not correctly' }
      }

      const token = jwt.sign({ id: userFound.id })

      return res.status(200).json({
        token,
        user: {
          id: userFound.id,
          name: userFound.name,
        },
      })
    } catch (error) {
      return next(error)
    }
  })

  return router
}

module.exports = UserControllerFactory
