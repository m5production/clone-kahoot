import { describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { toast } from 'react-toastify'
import { getApiErrorMessage, isNotFoundError, notifyApiError } from './api-error'

vi.mock('react-toastify', () => ({ toast: vi.fn() }))

const createAxiosError = (status?: number, data?: unknown) =>
  new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    status === undefined
      ? undefined
      : {
          status,
          statusText: '',
          data,
          headers: {},
          config: { headers: new AxiosHeaders() },
        }
  )

describe('getApiErrorMessage', () => {
  it('prefers the server error message', () => {
    expect(
      getApiErrorMessage(
        createAxiosError(404, {
          code: 'NOT_FOUND',
          message: 'User not found',
          requestId: 'r1',
        })
      )
    ).toBe('User not found')
  })

  it('handles a plain string body', () => {
    expect(getApiErrorMessage(createAxiosError(404, 'User not found'))).toBe(
      'User not found'
    )
  })

  it('falls back to the axios message without a body', () => {
    expect(getApiErrorMessage(createAxiosError(500, ''))).toBe('Request failed')
    expect(getApiErrorMessage(createAxiosError())).toBe('Request failed')
  })

  it('handles plain errors and other values', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('boom')
    expect(getApiErrorMessage('oops')).toBe('oops')
  })
})

describe('isNotFoundError', () => {
  it('is true only for an axios 404', () => {
    expect(isNotFoundError(createAxiosError(404))).toBe(true)
    expect(isNotFoundError(createAxiosError(500))).toBe(false)
    expect(isNotFoundError(createAxiosError())).toBe(false)
    expect(isNotFoundError(new Error('404'))).toBe(false)
  })
})

describe('notifyApiError', () => {
  it('shows the error message in a toast', () => {
    notifyApiError(createAxiosError(403, 'No game with id x is currently running'))

    expect(toast).toHaveBeenCalledWith('No game with id x is currently running')
  })
})
