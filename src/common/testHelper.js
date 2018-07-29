const createUser = async ({ request }) => {
  const user = {
    name: 'Test',
    email: `user${parseInt(Math.random() * 100000)}@gastar.me`,
    password: '123456',
  }

  await request.post('/users').send(user)

  return user
}

const loginUser = async ({ email, password, request }) => {
  const response = await request.post('/users/login').send({ email, password })

  return response.body
}

const loginUserAdmin = async ({ request }) => {
  const response = await request
    .post('/users/login')
    .send({ email: 'admin@gastar.me', password: 'admin' })

  return response.body
}

module.exports = {
  createUser,
  loginUser,
  loginUserAdmin,
}
