import type { UserCredentials } from '@/entities/user'
import { notifyApiError } from '@/shared/api'
import { registerUser } from './register.service'

export const useRegister = (onRegistered: () => void) => {
  const register = async (credentials: UserCredentials) => {
    try {
      await registerUser(credentials)
      onRegistered()
    } catch (error) {
      notifyApiError(error)
    }
  }

  return { register }
}
