import { useEffect } from 'react'
import { notifyApiError } from '@/shared/api'
import {
  clearSessionUserId,
  getSessionUserId,
  saveSessionUserId,
} from '@/entities/session'
import type { UserCredentials } from '@/entities/user'
import { isExistingUser, loginOrRegister } from './login.service'

export const useLogin = (onLoggedIn: () => void) => {
  useEffect(() => {
    const restoreSession = async () => {
      const userId = getSessionUserId()

      if (!userId || !(await isExistingUser(userId))) {
        clearSessionUserId()
        return
      }

      onLoggedIn()
    }

    restoreSession()
  }, [])

  const login = async (credentials: UserCredentials) => {
    try {
      const user = await loginOrRegister(credentials)

      saveSessionUserId(user.id)
      onLoggedIn()
    } catch (error) {
      notifyApiError(error)
    }
  }

  return { login }
}
