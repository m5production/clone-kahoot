import { useEffect } from 'react'
import {
  clearSession,
  getSessionToken,
  saveSessionToken,
  saveSessionUserId,
} from '@/entities/session'
import type { UserCredentials } from '@/entities/user'
import { notifyApiError } from '@/shared/api'
import { fetchSessionUser, loginOrRegister } from './login.service'

export const useLogin = (onLoggedIn: () => void) => {
  useEffect(() => {
    const restoreSession = async () => {
      if (!getSessionToken()) return

      const user = await fetchSessionUser()
      if (!user) {
        clearSession()
        return
      }

      saveSessionUserId(user.id)
      onLoggedIn()
    }

    restoreSession()
  }, [])

  const login = async (credentials: UserCredentials) => {
    try {
      const user = await loginOrRegister(credentials)

      saveSessionToken(user.token)
      saveSessionUserId(user.id)
      onLoggedIn()
    } catch (error) {
      notifyApiError(error)
    }
  }

  return { login }
}
