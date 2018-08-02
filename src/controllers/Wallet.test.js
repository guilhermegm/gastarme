const requestSuperTest = require('supertest')
const app = require('../index')
const testHelper = require('../common/testHelper')

const request = requestSuperTest(app)
let userData
let userLogged
let userWallet
let userAdminLogged
let userTwoWallet

describe('Wallet Controller', () => {
  beforeAll(async () => {
    userData = await testHelper.createUser({ request })
    userLogged = await testHelper.loginUser({
      email: userData.email,
      password: userData.password,
      request,
    })
    userAdminLogged = await testHelper.loginUserAdmin({ request })
  })

  it('should create a wallet for user', async () => {
    await request
      .post('/wallets')
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(201)
  })

  it('should get wallets of user', async () => {
    await request
      .get('/wallets')
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(200)
      .then(response => {
        userWallet = response.body[0]

        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('limit')
        expect(response.body[0]).toHaveProperty('available_limit')
      })
  })

  it('should get wallet of user by id', async () => {
    await request
      .get(`/wallets/${userWallet.id}`)
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty('id')
        expect(response.body).toHaveProperty('limit')
        expect(response.body).toHaveProperty('available_limit')
      })
  })

  it('should buy using a wallet of user', async () => {
    await testHelper.createCard({ userToken: userLogged.token, walletId: userWallet.id, request })

    await request
      .post(`/wallets/${userWallet.id}/buy`)
      .send({ totalValue: '1000.00' })
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(201)
  })

  it('should try to buy using a wallet without enough funds', async () => {
    try {
      await testHelper.createCard({ userToken: userLogged.token, walletId: userWallet.id, request })

      await request
        .post(`/wallets/${userWallet.id}/buy`)
        .send({ totalValue: '1500.00' })
        .set('Authorization', `Bearer ${userLogged.token}`)
        .expect(500)
    } catch (error) {
      expect(error).toEqual({ message: "You don't have enough funds to buy" })
    }
  })

  it('should get all wallets', async () => {
    await request
      .get('/wallets')
      .set('Authorization', `Bearer ${userAdminLogged.token}`)
      .expect(200)
      .then(response => {
        userTwoWallet = response.body[0]

        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('limit')
        expect(response.body[0]).toHaveProperty('available_limit')
      })
  })

  it('should delete a wallet', async () => {
    await request
      .delete(`/wallets/${userTwoWallet.id}`)
      .set('Authorization', `Bearer ${userAdminLogged.token}`)
      .expect(204)
  })

  it('should try to delete a wallet without authorization', async () => {
    await request
      .delete(`/wallets/${userTwoWallet.id}`)
      .set('Authorization', `Bearer ${userLogged.token}`)
      .expect(500)
      .then(response => {
        expect(response.body).toEqual({ message: 'You are not authorized' })
      })
  })
})
