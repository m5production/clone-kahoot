import { describe, expect, it } from 'vitest'
import { buildExpiredAuthCookie, hasAuthCookie } from './session.lib'

describe('hasAuthCookie', () => {
  it.each([
    ['authorization=user-1', true],
    ['theme=dark; authorization=user-1', true],
    ['authorisation=user-1', true],
    ['', false],
    ['theme=dark', false],
    ['authorization', false],
  ])('%j → %s', (cookie, expected) => {
    expect(hasAuthCookie(cookie)).toBe(expected)
  })
})

describe('buildExpiredAuthCookie', () => {
  it('expires the auth cookie for the whole domain', () => {
    expect(buildExpiredAuthCookie('example.com')).toBe(
      'authorization=; Max-Age=-1; path=/; domain=example.com;'
    )
  })
})
