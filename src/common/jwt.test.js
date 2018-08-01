const jwt = require('./jwt')

describe('Jwt', () => {
  it('should authenticate the user', async () => {
    const user = {
      id: 333,
      accessLevel: 'user',
    }
    const token = 'token'
    const req = {
      headers: {
        authorization: `authorization ${token}`,
      },
    }
    const decoded = {
      id: 1,
    }
    const User = {
      findById: jest.fn(() => Promise.resolve(user)),
    }
    const jwtDefault = {
      verify: jest.fn(() => decoded),
    }
    const next = jest.fn(() => {})

    await jwt.authentication({ User, jwt: jwtDefault })(req, null, next)

    expect(jwtDefault.verify.mock.calls.length).toBe(1)
    expect(jwtDefault.verify).toBeCalledWith(
      token,
      process.env.GASTARME_JWT_SECRET || 'hard-secret',
    )

    expect(User.findById.mock.calls.length).toBe(1)
    expect(User.findById).toBeCalledWith(decoded.id)

    expect(req.user).toEqual(user)

    expect(next.mock.calls.length).toBe(1)
    expect(next).toBeCalledWith()
  })

  it('should try to authenticate without authorization header', async () => {
    const req = {
      headers: {},
    }
    const User = {}
    const next = jest.fn(() => {})

    await jwt.authentication({ User })(req, null, next)

    expect(next.mock.calls.length).toBe(1)
    expect(next).toBeCalledWith({ message: 'You are not authenticated' })
  })

  it('should try to authenticate with invalid token', async () => {
    const user = {
      id: 333,
      accessLevel: 'user',
    }
    const token = 'invalid-token'
    const req = {
      headers: {
        authorization: `authorization ${token}`,
      },
    }
    const decoded = {
      id: 1,
    }
    const User = {}
    const next = jest.fn(() => {})

    await jwt.authentication({ User })(req, null, next)

    expect(next.mock.calls.length).toBe(1)
    expect(next).toBeCalledWith({ message: 'You are not authorized' })
  })

  it('should try to authenticate the user with no accessLevel', async () => {
    const user = {
      id: 333,
      accessLevel: 'user',
    }
    const token = 'token'
    const req = {
      headers: {
        authorization: `authorization ${token}`,
      },
    }
    const decoded = {
      id: 1,
    }
    const User = {
      findById: jest.fn(() => Promise.resolve(user)),
    }
    const jwtDefault = {
      verify: jest.fn(() => decoded),
    }
    const next = jest.fn(() => {})

    await jwt.authentication({ User, accessLevels: ['admin'], jwt: jwtDefault })(req, null, next)

    expect(jwtDefault.verify.mock.calls.length).toBe(1)
    expect(jwtDefault.verify).toBeCalledWith(
      token,
      process.env.GASTARME_JWT_SECRET || 'hard-secret',
    )

    expect(User.findById.mock.calls.length).toBe(1)
    expect(User.findById).toBeCalledWith(decoded.id)

    expect(next.mock.calls.length).toBe(1)
    expect(next).toBeCalledWith({ message: 'You are not authorized' })
  })
})
