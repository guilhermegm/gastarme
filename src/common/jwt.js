const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.GASTARME_JWT_SECRET || 'hard-secret'

const authentication = ({ accessLevels = ['user', 'admin'], User }) => async (req, res, next) => {
  if (!req.headers.authorization) {
    return next({ message: 'You are not authenticated' })
  }

  const token = req.headers.authorization.split(' ')[1]
  const decoded = jwt.verify(token, JWT_SECRET)

  const user = await User.findById(decoded.id)

  if (!user || !accessLevels.includes(user.accessLevel)) {
    return next({ message: 'You are not authorized' })
  }

  req.user = user

  return next()
}

const sign = ({ id }) => {
  return jwt.sign(
    {
      id,
    },
    JWT_SECRET,
    { expiresIn: '168h' },
  )
}

module.exports = { authentication, sign }
