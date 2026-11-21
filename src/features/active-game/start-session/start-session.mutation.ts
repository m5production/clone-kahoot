import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { createSession } from '@/entities/active-game'
import { notifyApiError } from '@/shared/api'

export const useStartSessionMutation = (
  onStarted: (sessionId: string) => void,
) =>
  useMutation({
    mutationFn: createSession,
    onSuccess: ({ sessionId }) => onStarted(sessionId),
    onError: (error) => {
      // BR-51: a session for this host/quiz is already running — the response
      // carries its id so the host can return to it
      const sessionId =
        isAxiosError<{ sessionId?: string }>(error) &&
        error.response?.status === 409
          ? error.response.data.sessionId
          : undefined

      if (sessionId) {
        onStarted(sessionId)
      } else {
        notifyApiError(error)
      }
    },
  })
