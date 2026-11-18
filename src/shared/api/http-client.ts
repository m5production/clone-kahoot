import axios from 'axios'
import { API_URL } from '@/shared/config'

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 1000,
  withCredentials: true,
})
