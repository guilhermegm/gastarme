const bodyParser = require('body-parser')
const express = require('express')

const app = express()

app.use(bodyParser.json())

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
