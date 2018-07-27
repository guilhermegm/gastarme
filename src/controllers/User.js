const express = require('express')
const Joi = require('joi')

const router = express.Router()

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

const UserControllerFactory = ({ User }) => {
  router.post('/', async (req, res, next) => {
    try {
      const createData = await Joi.validate(req.body, createSchema)

      const user = await User.create({ data: createData })

      return res.status(201).send()
    } catch (error) {
      return next(error)
    }
  })

  router.get('/', async (req, res, next) => {
    const users = await User.findAll()

    return res.status(200).json(users)
  })

  return router
}

module.exports = UserControllerFactory
