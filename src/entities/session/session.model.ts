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

export const clearSessionUserId = () =>
  localStorage.removeItem(USER_ID_STORAGE_KEY)

export const isAuthenticated = () => Boolean(getSessionToken())

export const clearSession = () => {
  clearSessionUserId()
  clearSessionToken()
}

/**
 * FR-72: a guest who follows an invitation link signs in and returns to it.
 * Only in-app paths are honoured — anything else is treated as no return url.
 */
export const getSafeReturnUrl = (value: string | null): string | null =>
  value?.startsWith('/') && !value.startsWith('//') ? value : null
