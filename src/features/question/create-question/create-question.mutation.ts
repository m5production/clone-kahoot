import { useMutation } from '@tanstack/react-query'
import { notifyApiError } from '@/shared/api'
import {
  createQuestion,
  GAME_QUESTIONS_QUERY,
  type Question,
} from '@/entities/question'

export const useCreateQuestionMutation = (
  onCreated?: (question: Question) => void
) =>
  useMutation({
    mutationFn: createQuestion,
    onSuccess: (question) => {
      GAME_QUESTIONS_QUERY.invalidate(question.gameId)
      onCreated?.(question)
    },
    onError: notifyApiError,
  })
