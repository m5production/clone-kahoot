import { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSessionToken, getSessionUserId } from '@/entities/session'
import { authenticateUser } from '@/entities/user'
import { loginUser } from './login.service'

vi.mock('@/entities/user', () => ({
  authenticateUser: vi.fn(),
}))

afterEach(() => {
  localStorage.clear()
})

const httpError = (status: number, message: string) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data: { code: 'ERR', message, requestId: 'r1' },
    headers: {},
    config: { headers: new AxiosHeaders() },
  })

const credentials = { name: 'alice', password: 'right-password' }
const alice = { id: 'u1', name: 'alice', token: 't1' }

describe('loginUser', () => {
  it('logs in an existing user and stores the session', async () => {
    vi.mocked(authenticateUser).mockResolvedValue(alice)

    await expect(loginUser(credentials)).resolves.toEqual(alice)
    expect(authenticateUser).toHaveBeenCalledWith(credentials)
    expect(getSessionToken()).toBe('t1')
    expect(getSessionUserId()).toBe('u1')
  })

  it('rejects wrong credentials without registering (FR-85)', async () => {
    const rejected = httpError(401, 'Invalid name or password')
    vi.mocked(authenticateUser).mockRejectedValue(rejected)

    await expect(loginUser(credentials)).rejects.toBe(rejected)
    expect(getSessionToken()).toBeNull()
  })
})
