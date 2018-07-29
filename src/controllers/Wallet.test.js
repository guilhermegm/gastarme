const request = require('supertest')
const app = require('../index')

describe('Wallet Controller', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNTMyNzE4Mjk1LCJleHAiOjE1MzMzMjMwOTV9.kSUWDEtjEMuc3u8C4bBr5sYPwbymDB8jb-eHMneceQU'
  const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjY0LCJpYXQiOjE1MzI4MzA0NDYsImV4cCI6MTUzMzQzNTI0Nn0.iCqReA-TJYog0y7O0glbfkMwNXG33njgEv-hpw2XyLE'
  let firstWallet;

  it('should create a wallet for user', async () => {
    await request(app)
      .post('/wallets')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
  })

  it('should get wallets of user', async () => {
    await request(app)
      .get('/wallets')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(response => {
        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('limit')
        expect(response.body[0]).toHaveProperty('available_limit')
      })
  })

  it('should get wallet of user by id', async () => {
    await request(app)
      .get('/wallets/4')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty('id')
        expect(response.body).toHaveProperty('limit')
        expect(response.body).toHaveProperty('available_limit')
      })
  })

  it('should buy using a wallet of user', async () => {
    await request(app)
      .post('/wallets/4/buy')
      .send({ totalValue: '210.10' })
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
  })

  it('should get all wallets', async () => {
    await request(app)
      .get('/wallets')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .then(response => {
        firstWallet = response.body[0]

        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('limit')
        expect(response.body[0]).toHaveProperty('available_limit')
      })
  })

  it('should delete a wallet', async () => {
    await request(app)
      .delete(`/wallets/${firstWallet.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204)
  })

  it('should try to delete a wallet without authorization', async () => {
    await request(app)
      .delete(`/wallets/${firstWallet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(500)
      .then(response => {
        expect(response.body).toEqual({"message": "You are not authorized"})
      })
  })
})
