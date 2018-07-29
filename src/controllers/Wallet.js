const express = require('express')
const Joi = require('joi')
const jwt = require('../common/jwt')

const router = express.Router()

const buySchema = Joi.object().keys({
  totalValue: Joi.string()
    .regex(/^\d{1,12}\.\d\d$/, 'currency')
    .required(),
})

const WalletControllerFactory = ({ Card, User, Wallet }) => {
  router.post('/wallets', jwt.authentication({ User }), async (req, res, next) => {
    try {
      const wallet = await Wallet.create(
        {
          userId: req.user.id,
          limit: 0,
          available_limit: 0,
        },
        { returning: true },
      )

      return res.status(201).json(wallet)
    } catch (error) {
      return next(error)
    }
  })

  router.get('/wallets', jwt.authentication({ User }), async (req, res, next) => {
    try {
      const accessLevelMap = {
        admin: {},
        user: { userId: req.user.id },
      }
      const paginationData = await Joi.validate(req.query, paginationSchema)
      const walletsFound = await Wallet.findAll({
        where: {
          ...accessLevelMap[req.user.accessLevel],
        },
        limit: paginationData.pageSize,
        offset: paginationData.page * paginationData.pageSize - paginationData.pageSize,
      })

      return res.status(200).json(
        walletsFound.map(wallet => ({
          id: wallet.id,
          limit: wallet.limit,
          available_limit: wallet.available_limit,
        })),
      )
    } catch (error) {
      return next(error)
    }
  })

  router.get('/wallets/:walletId', jwt.authentication({ User }), async (req, res, next) => {
    try {
      const wallet = await Wallet.findOne({
        where: { id: req.params.walletId, userId: req.user.id },
      })

      return res.status(200).json({
        id: wallet.id,
        limit: wallet.limit,
        available_limit: wallet.available_limit,
      })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/wallets/:walletId/buy', jwt.authentication({ User }), async (req, res, next) => {
    try {
      const walletId = await Joi.validate(
        req.params.walletId,
        Joi.number()
          .integer()
          .required(),
      )
      const buyData = await Joi.validate(req.body, buySchema)
      const invoice = await Wallet.buy({
        id: walletId,
        totalValue: buyData.totalValue,
        user: req.user,
        Card,
      })

      return res.status(201).json(invoice)
    } catch (error) {
      return next(error)
    }
  })

  router.delete(
    '/wallets/:walletId',
    jwt.authentication({ accessLevels: ['admin'], User }),
    async (req, res, next) => {
      try {
        const walletId = await Joi.validate(
          req.params.walletId,
          Joi.number()
            .integer()
            .required(),
        )
        await Wallet.delete({ id: walletId, Card })

        return res.status(204).send()
      } catch (error) {
        return next(error)
      }
    },
  )

  return router
}

module.exports = WalletControllerFactory
