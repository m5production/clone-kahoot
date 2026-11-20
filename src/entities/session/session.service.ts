import { fetchCurrentUser, type User } from '@/entities/user' // FSD: cross import
import {
  clearSession,
  getSessionToken,
  saveSessionUserId,
} from './session.model'

/**
 * Restores the session: resolves with the current user when the stored token
 * is valid, clears the stored session otherwise.
 */
export const restoreSession = async (): Promise<User | null> => {
  if (!getSessionToken()) return null

  try {
    const user = await fetchCurrentUser()
    saveSessionUserId(user.id)
    return user
  } catch {
    clearSession()
    return null
  }
}
