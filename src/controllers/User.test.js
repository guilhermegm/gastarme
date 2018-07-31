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

  it('should login an user', async () => {
    await request(app)
      .post('/users/login')
      .send({ email: newEmail, password: 'abc123' })
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty('token')
        expect(response.body).toHaveProperty('user.id')
        expect(response.body).toHaveProperty('user.name', 'Test')
      })
  })
})
