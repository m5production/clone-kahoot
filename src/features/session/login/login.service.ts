import { saveSessionToken, saveSessionUserId } from '@/entities/session'
import {
  type AuthResponse,
  authenticateUser,
  type UserCredentials,
} from '@/entities/user'

/**
 * Logs in an existing user (FR-85): unknown names and wrong passwords are
 * rejected, no account is created. Stores the returned session.
 */
export const loginUser = async (
  credentials: UserCredentials,
): Promise<AuthResponse> => {
  const auth = await authenticateUser(credentials)
  saveSessionToken(auth.token)
  saveSessionUserId(auth.id)
  return auth
}
