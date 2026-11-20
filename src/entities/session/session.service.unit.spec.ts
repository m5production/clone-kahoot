import { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchCurrentUser } from '@/entities/user'
import {
  getSessionToken,
  getSessionUserId,
  saveSessionToken,
} from './session.model'
import { restoreSession } from './session.service'

vi.mock('@/entities/user', () => ({
  fetchCurrentUser: vi.fn(),
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

describe('restoreSession', () => {
  it('does not call the backend without a stored token', async () => {
    await expect(restoreSession()).resolves.toBeNull()
    expect(fetchCurrentUser).not.toHaveBeenCalled()
  })

  it('returns the current user and stores the id for a valid session', async () => {
    saveSessionToken('t1')
    vi.mocked(fetchCurrentUser).mockResolvedValue({ id: 'u1', name: 'alice' })

    await expect(restoreSession()).resolves.toEqual({ id: 'u1', name: 'alice' })
    expect(getSessionUserId()).toBe('u1')
    expect(getSessionToken()).toBe('t1')
  })

  it('clears the stored session when the token is rejected', async () => {
    saveSessionToken('stale')
    vi.mocked(fetchCurrentUser).mockRejectedValue(
      httpError(401, 'Authentication required'),
    )

    await expect(restoreSession()).resolves.toBeNull()
    expect(getSessionToken()).toBeNull()
    expect(getSessionUserId()).toBeNull()
  })
})
