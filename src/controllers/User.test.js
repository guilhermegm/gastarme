const request = require('supertest')
const app = require('../index')

describe('User Controller', () => {
  const newEmail = `email${parseInt(Math.random() * 10000)}@email.co`

  it('should create an user properly', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'Test', password: 'abc123', email: newEmail })
      .expect(201)
  })

  it('should throw error 500 when user exists', async () => {
    await request(app)
      .post('/users')
      .send({ name: 'Test', password: 'abc123', email: newEmail })
      .expect(500)
  })
})
