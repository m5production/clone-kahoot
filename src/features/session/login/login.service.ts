import {
  authenticateUser,
  createUser,
  fetchCurrentUser,
  type User,
  type UserCredentials,
} from '@/entities/user'
import { isUnauthorizedError, notifyApiError } from '@/shared/api'

const authenticateOrNull = async (credentials: UserCredentials) => {
  try {
    return await authenticateUser(credentials)
  } catch (error) {
    if (!isUnauthorizedError(error)) notifyApiError(error)

    return null
  }
}

/** Logs in with the credentials or registers a new user when the login is rejected */
export const loginOrRegister = async (credentials: UserCredentials) =>
  (await authenticateOrNull(credentials)) ?? createUser(credentials)

/** Restores the session: resolves with the current user when the stored token is valid */
export const fetchSessionUser = async (): Promise<User | null> => {
  try {
    return await fetchCurrentUser()
  } catch {
    return null
  }
}
