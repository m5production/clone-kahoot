import { toast } from 'react-toastify'
import { isNotFoundError, notifyApiError } from '@/shared/api'
import {
  authenticateUser,
  createUser,
  fetchUserById,
  type UserCredentials,
} from '@/entities/user'

const authenticateOrNull = async (credentials: UserCredentials) => {
  try {
    return await authenticateUser(credentials)
  } catch (error) {
    if (!isNotFoundError(error)) notifyApiError(error)

    return null
  }
}

/** Logs in with the credentials or registers a new user when no such user exists */
export const loginOrRegister = async (credentials: UserCredentials) =>
  (await authenticateOrNull(credentials)) ?? createUser(credentials)

export const isExistingUser = async (userId: string) => {
  try {
    await fetchUserById(userId)

    return true
  } catch (error) {
    if (error instanceof Error) toast(error.message)

    return false
  }
}
