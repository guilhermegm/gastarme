const requestSuperTest = require('supertest')
const app = require('../index')
const testHelper = require('../common/testHelper')

const request = requestSuperTest(app)
let userData
let userLogged
let userWallets
let userCards

describe('Card Controller', () => {
  const cardNumber = `123 456 ${parseInt(Math.random() * 10000)}`

  beforeAll(async () => {
    userData = await testHelper.createUser({ request })
    userLogged = await testHelper.loginUser({
      email: userData.email,
      password: userData.password,
      request,
    })
    await testHelper.createWallet({ userToken: userLogged.token, request })
    userWallets = await testHelper.getWallets({ userToken: userLogged.token, request })
  })

  it('should create a card for wallet', async () => {
    await request
      .post('/cards')
      .send({
        number: cardNumber,
        bearer_name: 'Test Card',
        cvv: '999',
        validity: '2021-10-10',
        limit: '1000.00',
        maturity: 3,
        walletId: userWallets[0].id,
      })
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(201)
  })

  it('should try to create a card and get already registered', async () => {
    await request
      .post('/cards')
      .send({
        number: cardNumber,
        bearer_name: 'Test Card',
        cvv: '999',
        validity: '2021-10-10',
        limit: '1000.00',
        maturity: 30,
        walletId: userWallets[0].id,
      })
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(500)
      .then(response => {
        expect(response.body).toEqual({ message: 'Card already registered' })
      })
  })

  it('should get list of cards for user', async () => {
    await request
      .get('/cards')
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(200)
      .then(response => {
        userCards = response.body

        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('bearer_name')
        expect(response.body[0]).toHaveProperty('limit')
        expect(response.body[0]).toHaveProperty('maturity')
        expect(response.body[0]).toHaveProperty('createdAt')
      })
  })

  it('should delete a card of user', async () => {
    await request
      .delete(`/cards/${userCards[0].id}`)
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(204)
  })

  it('should try to delete a card that was deleted', async () => {
    await request
      .delete(`/cards/${userCards[0].id}`)
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(500)
      .then(response => {
        expect(response.body).toEqual({ message: 'Not found' })
      })
  })
})
