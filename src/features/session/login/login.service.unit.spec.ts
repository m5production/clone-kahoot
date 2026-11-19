import { AxiosError, AxiosHeaders } from 'axios'
import { toast } from 'react-toastify'
import { describe, expect, it, vi } from 'vitest'
import { authenticateUser, createUser, fetchCurrentUser } from '@/entities/user'
import { fetchSessionUser, loginOrRegister } from './login.service'

vi.mock('react-toastify', () => ({ toast: vi.fn() }))
vi.mock('@/entities/user', () => ({
  authenticateUser: vi.fn(),
  createUser: vi.fn(),
  fetchCurrentUser: vi.fn(),
}))

const httpError = (status: number, message: string) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data: { code: 'ERR', message, requestId: 'r1' },
    headers: {},
    config: { headers: new AxiosHeaders() },
  })

const credentials = { name: 'alice', password: 'secret' }
const alice = { id: 'u1', name: 'alice', token: 't1' }

describe('loginOrRegister', () => {
  it('logs in an existing user', async () => {
    vi.mocked(authenticateUser).mockResolvedValue(alice)

    await expect(loginOrRegister(credentials)).resolves.toEqual(alice)
    expect(createUser).not.toHaveBeenCalled()
  })

  it('registers the user when the credentials are rejected', async () => {
    vi.mocked(authenticateUser).mockRejectedValue(
      httpError(401, 'Invalid name or password'),
    )
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
    const taken = httpError(409, 'There is a user with such a name')
    vi.mocked(authenticateUser).mockRejectedValue(httpError(401, 'Invalid'))
    vi.mocked(createUser).mockRejectedValue(taken)

    await expect(loginOrRegister(credentials)).rejects.toBe(taken)
  })
})

describe('fetchSessionUser', () => {
  it('returns the current user for a valid session', async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue(alice)

    await expect(fetchSessionUser()).resolves.toEqual(alice)
  })

  it('returns null when the session is invalid', async () => {
    vi.mocked(fetchCurrentUser).mockRejectedValue(
      httpError(401, 'Authentication required'),
    )

    await expect(fetchSessionUser()).resolves.toBeNull()
  })
})
