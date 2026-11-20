import type { UserCredentials } from '@/entities/user'
import { notifyApiError } from '@/shared/api'
import { loginUser } from './login.service'

export const useLogin = (onLoggedIn: () => void) => {
  const login = async (credentials: UserCredentials) => {
    try {
      await loginUser(credentials)
      onLoggedIn()
    } catch (error) {
      notifyApiError(error)
    }
  }

  return { login }
}
