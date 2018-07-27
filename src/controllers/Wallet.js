const express = require('express')
const jwt = require('../common/jwt')

const router = express.Router()

const WalletControllerFactory = ({ User, Wallet }) => {
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

  return router
}

module.exports = WalletControllerFactory
