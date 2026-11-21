import { useMutation } from '@tanstack/react-query'
import {
  ACCEPTED_ANSWERS_QUERY,
  type RawAcceptedAnswer,
  replaceAcceptedAnswers,
} from '@/entities/accepted-answer'
import {
  ANSWER_OPTIONS_QUERY,
  type RawAnswerOption,
  replaceAnswerOptions,
} from '@/entities/answer-option'
import {
  GAME_QUESTIONS_QUERY,
  QUESTION_QUERY,
  type Question,
  updateQuestion,
} from '@/entities/question'
import { notifyApiError } from '@/shared/api'

interface SaveQuestionVariables {
  question: Pick<Question, 'id' | 'text' | 'img' | 'timeLimitSec' | 'type'>
  /** exactly one of the two is sent — the set matching the question's type (D-12) */
  answers?: RawAcceptedAnswer[]
  options?: RawAnswerOption[]
}

/** Saves the question and its answers/options as one action: a single pending
    state and one success/error signal instead of two competing mutations */
export const useSaveQuestionMutation = () =>
  useMutation({
    mutationFn: async ({
      question,
      answers,
      options,
    }: SaveQuestionVariables) => {
      // the question update goes first — a type switch drops the other
      // kind's set on the backend before the new one is written (D-12)
      const updated = await updateQuestion(question)
      if (options) await replaceAnswerOptions(question.id, options)
      else if (answers) await replaceAcceptedAnswers(question.id, answers)

      return updated
    },
    onSuccess: (question) => {
      QUESTION_QUERY.invalidate(question.id)
      ACCEPTED_ANSWERS_QUERY.invalidate(question.id)
      ANSWER_OPTIONS_QUERY.invalidate(question.id)
      // the question text, type and counts affect the list readiness marker
      GAME_QUESTIONS_QUERY.invalidate(question.gameId)
    },
    onError: notifyApiError,
  })
