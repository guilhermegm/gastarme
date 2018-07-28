const bodyParser = require('body-parser')
const express = require('express')
const CardFactory = require('./models/Card')
const CardControllerFactory = require('./controllers/Card')
const UserFactory = require('./models/User')
const UserControllerFactory = require('./controllers/User')
const WalletFactory = require('./models/Wallet')
const WalletControllerFactory = require('./controllers/Wallet')

const app = express()
const Card = CardFactory()
const User = UserFactory()
const Wallet = WalletFactory()
const CardController = CardControllerFactory({ Card, User, Wallet })
const UserController = UserControllerFactory({ User })
const WalletController = WalletControllerFactory({ Card, User, Wallet })

app.use(bodyParser.json())

app.use('/', UserController)
app.use(WalletController)
app.use(CardController)

app.use((error, req, res, next) => {
  if (error.isJoi) {
    return res.status(500).json(error.details)
  }

  return res.status(500).json(error)
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => console.log('Listening on port 3000!'))
}

module.exports = app
