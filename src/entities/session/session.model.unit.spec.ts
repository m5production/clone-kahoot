import { afterEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  clearSessionUserId,
  getSessionToken,
  getSessionUserId,
  isAuthenticated,
  saveSessionToken,
  saveSessionUserId,
} from './session.model'

afterEach(() => {
  localStorage.clear()
})

describe('session user id', () => {
  it('is null when nothing is stored', () => {
    expect(getSessionUserId()).toBeNull()
  })

  it('is saved and cleared', () => {
    saveSessionUserId('user-1')
    expect(getSessionUserId()).toBe('user-1')

    clearSessionUserId()
    expect(getSessionUserId()).toBeNull()
  })
})

describe('session token', () => {
  it('drives isAuthenticated', () => {
    expect(isAuthenticated()).toBe(false)

    saveSessionToken('token-1')
    expect(getSessionToken()).toBe('token-1')
    expect(isAuthenticated()).toBe(true)
  })
})

describe('clearSession', () => {
  it('removes the stored user id and token', () => {
    saveSessionUserId('user-1')
    saveSessionToken('token-1')

    clearSession()

    expect(getSessionUserId()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })
})
