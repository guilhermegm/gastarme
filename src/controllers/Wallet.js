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

  return router
}

module.exports = WalletControllerFactory
