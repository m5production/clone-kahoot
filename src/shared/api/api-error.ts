import { isAxiosError } from 'axios'
import { toast } from 'react-toastify'

export const isNotFoundError = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 404

interface ApiErrorBody {
  code?: string
  message?: string
  requestId?: string
}

export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data: ApiErrorBody | string | undefined = error.response?.data

    if (typeof data === 'object' && data?.message) return data.message
    if (typeof data === 'string' && data) return data

    return error.message
  }

  if (error instanceof Error) return error.message

  return String(error)
}

export const notifyApiError = (error: unknown) => {
  toast(getApiErrorMessage(error))
}
