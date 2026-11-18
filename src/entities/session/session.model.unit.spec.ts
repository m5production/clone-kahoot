import { afterEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  clearSessionUserId,
  getSessionUserId,
  isAuthenticated,
  saveSessionUserId,
} from './session.model'

afterEach(() => {
  localStorage.clear()
  document.cookie = 'authorization=; Max-Age=-1; path=/'
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

describe('isAuthenticated', () => {
  it('follows the auth cookie', () => {
    expect(isAuthenticated()).toBe(false)

    document.cookie = 'authorization=user-1; path=/'
    expect(isAuthenticated()).toBe(true)
  })
})

describe('clearSession', () => {
  it('removes the stored user id and the auth cookie', () => {
    saveSessionUserId('user-1')
    document.cookie = `authorization=user-1; path=/; domain=${window.location.hostname}`

    clearSession()

    expect(getSessionUserId()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })
})
