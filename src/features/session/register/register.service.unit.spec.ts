import { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSessionToken, getSessionUserId } from '@/entities/session'
import { createUser } from '@/entities/user'
import { registerUser } from './register.service'

vi.mock('@/entities/user', () => ({
  createUser: vi.fn(),
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

describe('registerUser', () => {
  it('registers a user and stores the returned session (FR-86)', async () => {
    vi.mocked(createUser).mockResolvedValue(alice)

    await expect(registerUser(credentials)).resolves.toEqual(alice)
    expect(createUser).toHaveBeenCalledWith(credentials)
    expect(getSessionToken()).toBe('t1')
    expect(getSessionUserId()).toBe('u1')
  })

  it('rejects a taken name without storing a session', async () => {
    const taken = httpError(409, 'There is a user with such a name')
    vi.mocked(createUser).mockRejectedValue(taken)

    await expect(registerUser(credentials)).rejects.toBe(taken)
    expect(getSessionToken()).toBeNull()
  })
})
