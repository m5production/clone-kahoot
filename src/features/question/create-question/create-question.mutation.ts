import { useMutation } from '@tanstack/react-query'
import {
  createQuestion,
  GAME_QUESTIONS_QUERY,
  type Question,
} from '@/entities/question'
import { notifyApiError } from '@/shared/api'

export const useCreateQuestionMutation = (
  onCreated?: (question: Question) => void,
) =>
  useMutation({
    mutationFn: createQuestion,
    onSuccess: (question) => {
      GAME_QUESTIONS_QUERY.invalidate(question.gameId)
      onCreated?.(question)
    },
    onError: notifyApiError,
  })
