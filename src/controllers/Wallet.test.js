const request = require('supertest')
const app = require('../index')

describe('Wallet Controller', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNTMyNzE4Mjk1LCJleHAiOjE1MzMzMjMwOTV9.kSUWDEtjEMuc3u8C4bBr5sYPwbymDB8jb-eHMneceQU'

  it('should create a wallet for user', async () => {
    await request(app)
      .post('/wallets')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
  })
})
