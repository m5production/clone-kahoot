import { useMutation } from '@tanstack/react-query'
import {
  ACCEPTED_ANSWERS_QUERY,
  type RawAcceptedAnswer,
  replaceAcceptedAnswers,
} from '@/entities/accepted-answer'
import { QUESTION_QUERY, updateQuestion } from '@/entities/question'
import { notifyApiError } from '@/shared/api'

export const useUpdateQuestionMutation = () =>
  useMutation({
    mutationFn: updateQuestion,
    onSuccess: (question) => {
      QUESTION_QUERY.invalidate(question.id)
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
      answers: RawAcceptedAnswer[]
    }) => replaceAcceptedAnswers(questionId, answers),
    onSuccess: (_, { questionId }) => {
      ACCEPTED_ANSWERS_QUERY.invalidate(questionId)
    },
    onError: notifyApiError,
  })
