import { useMutation } from '@tanstack/react-query'
import { notifyApiError } from '@/shared/api'
import {
  ACCEPTED_ANSWERS_QUERY,
  deleteAcceptedAnswers,
} from '@/entities/accepted-answer'
import {
  deleteQuestion,
  GAME_QUESTIONS_QUERY,
  QUESTION_QUERY,
} from '@/entities/question'

const deleteQuestionWithAnswers = async (questionId: string) => {
  const [question] = await Promise.all([
    deleteQuestion(questionId),
    deleteAcceptedAnswers(questionId),
  ])

  return question
}

export const useDeleteQuestionMutation = (onDeleted?: () => void) =>
  useMutation({
    mutationFn: deleteQuestionWithAnswers,
    onSuccess: (question) => {
      QUESTION_QUERY.invalidate(question.id)
      GAME_QUESTIONS_QUERY.invalidate(question.gameId)
      ACCEPTED_ANSWERS_QUERY.invalidate(question.id)
      onDeleted?.()
    },
    onError: notifyApiError,
  })
