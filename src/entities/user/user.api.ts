import { httpClient } from '@/shared/api'
import type { User, UserCredentials } from './user.types'

export const fetchUserById = async (userId: string) => {
  const { data } = await httpClient.get<User>(`/users/${userId}`)

  return data
}

export const authenticateUser = async (credentials: UserCredentials) => {
  const { data } = await httpClient.post<User>('/users/auth', credentials)

  return data
}

export const createUser = async (credentials: UserCredentials) => {
  const { data } = await httpClient.post<User>('/users', credentials)

  return data
}
