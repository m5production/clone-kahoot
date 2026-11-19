import { httpClient } from '@/shared/api'
import type { User, UserCredentials } from './user.types'

export interface AuthResponse extends User {
  token: string
}

export const fetchUserById = async (userId: string) => {
  const { data } = await httpClient.get<User>(`/users/${userId}`)

  return data
}

export const fetchCurrentUser = async () => {
  const { data } = await httpClient.get<User>('/users/me')

  return data
}

export const authenticateUser = async (credentials: UserCredentials) => {
  const { data } = await httpClient.post<AuthResponse>('/users/auth', credentials)

  return data
}

export const createUser = async (credentials: UserCredentials) => {
  const { data } = await httpClient.post<AuthResponse>('/users', credentials)

  return data
}

export const logoutUser = async () => {
  await httpClient.post('/users/logout')
}
