import axios from 'axios'
import { API_URL } from '@/shared/config'
import { getSessionToken } from './session-token'

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 5000,
})

httpClient.interceptors.request.use((config) => {
  const token = getSessionToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)

  return config
})
