import { describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { toast } from 'react-toastify'
import { authenticateUser, createUser, fetchUserById } from '@/entities/user'
import { isExistingUser, loginOrRegister } from './login.service'

vi.mock('react-toastify', () => ({ toast: vi.fn() }))
vi.mock('@/entities/user', () => ({
  authenticateUser: vi.fn(),
  createUser: vi.fn(),
  fetchUserById: vi.fn(),
}))

const httpError = (status: number, data: string) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  })

const credentials = { name: 'alice', password: 'secret' }
const alice = { id: 'u1', name: 'alice' }

describe('loginOrRegister', () => {
  it('logs in an existing user', async () => {
    vi.mocked(authenticateUser).mockResolvedValue(alice)

    await expect(loginOrRegister(credentials)).resolves.toEqual(alice)
    expect(createUser).not.toHaveBeenCalled()
  })

  it('registers the user when the credentials are unknown', async () => {
    vi.mocked(authenticateUser).mockRejectedValue(httpError(404, 'User not found'))
    vi.mocked(createUser).mockResolvedValue(alice)

    await expect(loginOrRegister(credentials)).resolves.toEqual(alice)
    expect(createUser).toHaveBeenCalledWith(credentials)
    expect(toast).not.toHaveBeenCalled()
  })

  it('reports an unexpected login error and still tries to register', async () => {
    vi.mocked(authenticateUser).mockRejectedValue(httpError(500, 'DB is down'))
    vi.mocked(createUser).mockResolvedValue(alice)

    await expect(loginOrRegister(credentials)).resolves.toEqual(alice)
    expect(toast).toHaveBeenCalledWith('DB is down')
  })

  it('fails when the name is taken by another password', async () => {
    const taken = httpError(404, 'There is a user with such a name')
    vi.mocked(authenticateUser).mockRejectedValue(httpError(404, 'User not found'))
    vi.mocked(createUser).mockRejectedValue(taken)

    await expect(loginOrRegister(credentials)).rejects.toBe(taken)
  })
})

describe('isExistingUser', () => {
  it('is true when the user is found', async () => {
    vi.mocked(fetchUserById).mockResolvedValue(alice)

    await expect(isExistingUser('u1')).resolves.toBe(true)
  })

  it('is false and reports the error otherwise', async () => {
    vi.mocked(fetchUserById).mockRejectedValue(httpError(404, 'User was not found'))

    await expect(isExistingUser('u1')).resolves.toBe(false)
    expect(toast).toHaveBeenCalledWith('Request failed')
  })
})
