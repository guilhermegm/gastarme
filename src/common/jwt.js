var jsonwebtoken = require('jsonwebtoken')

const JWT_SECRET = process.env.GASTARME_JWT_SECRET || 'hard-secret'

const sign = ({ id }) => {
  return jsonwebtoken.sign(
    {
      id,
    },
    JWT_SECRET,
    { expiresIn: '168h' },
  )
}

module.exports = { sign }
