const express = require('express')
const Joi = require('joi')
const jwt = require('../common/jwt')

const router = express.Router()

const createSchema = Joi.object().keys({
  number: Joi.string()
    .min(7)
    .required(),
  bearer_name: Joi.string().required(),
  cvv: Joi.string().required(),
  validity: Joi.date()
    .iso()
    .required(),
  limit: Joi.string()
    .regex(/^\d{1,12}\.\d\d$/, 'currency')
    .required(),
  maturity: Joi.number()
    .integer()
    .min(1)
    .max(31)
    .required(),
  walletId: Joi.number()
    .integer()
    .required(),
})

const CardControllerFactory = ({ User, Wallet, Card }) => {
  router.post('/cards', jwt.authentication({ User }), async (req, res, next) => {
    try {
      const createData = await Joi.validate(req.body, createSchema)
      const card = await Card.register({ ...createData, user: req.user, Wallet })

      return res.status(201).json(card)
    } catch (error) {
      return next(error)
    }
  })

  router.get('/cards', jwt.authentication({ User }), async (req, res, next) => {
    try {
      const paginationData = await Joi.validate(req.query, paginationSchema)
      const cardsFound = await Card.findAll({
        where: {
          userId: req.user.id,
        },
        limit: paginationData.pageSize,
        offset: paginationData.page * paginationData.pageSize - paginationData.pageSize,
      })

      return res.status(200).json(
        cardsFound.map(card => ({
          id: card.id,
          bearer_name: card.bearer_name,
          limit: card.limit,
          maturity: card.maturity,
          validity: card.validity,
          createdAt: card.createdAt,
        })),
      )
    } catch (error) {
      return next(error)
    }
  })

  router.delete('/cards/:cardId', jwt.authentication({ User }), async (req, res, next) => {
    try {
      const cardId = await Joi.validate(
        req.params.cardId,
        Joi.number()
          .integer()
          .required(),
      )

      const deleteCount = await Card.destroy({ where: { id: cardId, userId: req.user.id } })

      if (deleteCount === 0) {
        throw { message: 'Not found' }
      }

      return res.status(204).json()
    } catch (error) {
      return next(error)
    }
  })

  return router
}

module.exports = CardControllerFactory
