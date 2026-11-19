import {
  clearSessionToken,
  getSessionToken,
  saveSessionToken,
} from '@/shared/api' // FSD: cross import

export { clearSessionToken, getSessionToken, saveSessionToken }

const USER_ID_STORAGE_KEY = 'userId'

export const getSessionUserId = () => localStorage.getItem(USER_ID_STORAGE_KEY)

export const saveSessionUserId = (userId: string) =>
  localStorage.setItem(USER_ID_STORAGE_KEY, userId)

export const clearSessionUserId = () => localStorage.removeItem(USER_ID_STORAGE_KEY)

export const isAuthenticated = () => Boolean(getSessionToken())

export const clearSession = () => {
  clearSessionUserId()
  clearSessionToken()
}
