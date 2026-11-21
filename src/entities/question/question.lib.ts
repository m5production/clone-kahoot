import type { Question } from './question.types'

/**
 * BR-49/D-15: a question is game-ready when it has text and its own kind of
 * answers — an open question needs at least one accepted answer, a choice
 * question needs 2-4 options (the backend stores them only with exactly one
 * correct, so the count implies validity, BR-86). A quiz is launchable when it
 * has at least one question and every question is ready.
 */
export const isQuestionReady = (
  question: Pick<Question, 'text' | 'answersCount' | 'optionsCount' | 'type'>,
): boolean => {
  if (!question.text.trim()) return false
  if (question.type === 'choice') {
    return question.optionsCount >= 2 && question.optionsCount <= 4
  }
  return question.answersCount > 0
}

export const isQuizReady = (
  questions: Pick<
    Question,
    'text' | 'answersCount' | 'optionsCount' | 'type'
  >[],
): boolean => questions.length > 0 && questions.every(isQuestionReady)
