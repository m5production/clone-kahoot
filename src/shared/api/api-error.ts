import { isAxiosError } from 'axios'
import { toast } from 'react-toastify'

export const isNotFoundError = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 404

export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) return String(error.response?.data || error.message)

  if (error instanceof Error) return error.message

  return String(error)
}

export const notifyApiError = (error: unknown) => {
  toast(getApiErrorMessage(error))
}
