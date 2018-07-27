const request = require('supertest')
const app = require('../index')

describe('Card Controller', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNTMyNzE4Mjk1LCJleHAiOjE1MzMzMjMwOTV9.kSUWDEtjEMuc3u8C4bBr5sYPwbymDB8jb-eHMneceQU'
  const cardNumber = `123 456 ${parseInt(Math.random() * 10000)}`

  it('should create a card for wallet', async () => {
    await request(app)
      .post('/cards')
      .send({
        number: cardNumber,
        bearer_name: 'Test Card',
        cvv: '999',
        validity: '2021-10-10',
        limit: '1000.00',
        maturity: 3,
        walletId: 4,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
  })

  it('should try to create a card and get already registered', async () => {
    await request(app)
      .post('/cards')
      .send({
        number: cardNumber,
        bearer_name: 'Test Card',
        cvv: '999',
        validity: '2021-10-10',
        limit: '1000.00',
        maturity: 30,
        walletId: 4,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(500)
      .then(response => {
        expect(response.body).toEqual({ message: 'Card already registered' })
      })
  })

  it('should get list of cards for user', async () => {
    await request(app)
      .get('/cards')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(response => {
        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('bearer_name')
        expect(response.body[0]).toHaveProperty('limit')
        expect(response.body[0]).toHaveProperty('maturity')
        expect(response.body[0]).toHaveProperty('createdAt')
      })
  })
})
