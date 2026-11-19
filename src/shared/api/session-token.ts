const SESSION_TOKEN_STORAGE_KEY = 'sessionToken'

export const getSessionToken = () =>
  localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)

export const saveSessionToken = (token: string) =>
  localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token)

export const clearSessionToken = () =>
  localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
