export const AUTH_COOKIE_NAME = 'authorization'
const LEGACY_AUTH_COOKIE_NAME = 'authorisation'

export const hasAuthCookie = (cookie: string) =>
  cookie.includes(`${AUTH_COOKIE_NAME}=`) ||
  cookie.includes(`${LEGACY_AUTH_COOKIE_NAME}=`)

export const buildExpiredAuthCookie = (domain: string) =>
  `${AUTH_COOKIE_NAME}=; Max-Age=-1; path=/; domain=${domain};`
