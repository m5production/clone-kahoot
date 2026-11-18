import { buildExpiredAuthCookie, hasAuthCookie } from './session.lib'

const USER_ID_STORAGE_KEY = 'userId'

export const getSessionUserId = () => localStorage.getItem(USER_ID_STORAGE_KEY)

export const saveSessionUserId = (userId: string) =>
  localStorage.setItem(USER_ID_STORAGE_KEY, userId)

export const clearSessionUserId = () =>
  localStorage.removeItem(USER_ID_STORAGE_KEY)

export const isAuthenticated = () => hasAuthCookie(document.cookie)

export const clearSession = () => {
  clearSessionUserId()
  document.cookie = buildExpiredAuthCookie(window.location.hostname)
}
