import { saveSessionToken, saveSessionUserId } from '@/entities/session'
import {
  type AuthResponse,
  createUser,
  type UserCredentials,
} from '@/entities/user'

/**
 * Registers a new user (FR-86): the API returns a session token, so the user
 * is signed in right away. A taken name is rejected.
 */
export const registerUser = async (
  credentials: UserCredentials,
): Promise<AuthResponse> => {
  const auth = await createUser(credentials)
  saveSessionToken(auth.token)
  saveSessionUserId(auth.id)
  return auth
}
