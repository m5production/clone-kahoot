import { useMutation } from '@tanstack/react-query'
import {
  ACCEPTED_ANSWERS_QUERY,
  type RawAcceptedAnswer,
  replaceAcceptedAnswers,
} from '@/entities/accepted-answer'
import {
  GAME_QUESTIONS_QUERY,
  QUESTION_QUERY,
  type Question,
  updateQuestion,
} from '@/entities/question'
import { notifyApiError } from '@/shared/api'

interface SaveQuestionVariables {
  question: Pick<Question, 'id' | 'text' | 'img' | 'timeLimitSec'>
  answers: RawAcceptedAnswer[]
}

/** Saves the question and its accepted answers as one action: a single pending
    state and one success/error signal instead of two competing mutations */
export const useSaveQuestionMutation = () =>
  useMutation({
    mutationFn: async ({ question, answers }: SaveQuestionVariables) => {
      const updated = await updateQuestion(question)
      await replaceAcceptedAnswers(question.id, answers)

      return updated
    },
    onSuccess: (question) => {
      QUESTION_QUERY.invalidate(question.id)
      ACCEPTED_ANSWERS_QUERY.invalidate(question.id)
      // the question text and answersCount affect the list readiness marker
      GAME_QUESTIONS_QUERY.invalidate(question.gameId)
    },
    onError: notifyApiError,
  })
