import { useMutation } from '@tanstack/react-query'
import {
  ACCEPTED_ANSWERS_QUERY,
  type RawAcceptedAnswer,
  replaceAcceptedAnswers,
} from '@/entities/accepted-answer'
import {
  GAME_QUESTIONS_QUERY,
  QUESTION_QUERY,
  updateQuestion,
} from '@/entities/question'
import { notifyApiError } from '@/shared/api'

export const useUpdateQuestionMutation = () =>
  useMutation({
    mutationFn: updateQuestion,
    onSuccess: (question) => {
      QUESTION_QUERY.invalidate(question.id)
      // the question text affects the readiness marker in the questions list
      GAME_QUESTIONS_QUERY.invalidate(question.gameId)
    },
    onError: notifyApiError,
  })

export const useReplaceAcceptedAnswersMutation = () =>
  useMutation({
    mutationFn: ({
      questionId,
      answers,
    }: {
      questionId: string
      gameId?: string
      answers: RawAcceptedAnswer[]
    }) => replaceAcceptedAnswers(questionId, answers),
    onSuccess: (_, { questionId, gameId }) => {
      ACCEPTED_ANSWERS_QUERY.invalidate(questionId)
      // answersCount lives on the questions list (BR-49 readiness)
      if (gameId) GAME_QUESTIONS_QUERY.invalidate(gameId)
    },
    onError: notifyApiError,
  })
