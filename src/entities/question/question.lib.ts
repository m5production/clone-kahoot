import type { Question } from './question.types'

/**
 * BR-49: a question is game-ready when it has text and at least one accepted
 * answer; a quiz is launchable when it has at least one question and every
 * question is ready.
 */
export const isQuestionReady = (
  question: Pick<Question, 'text' | 'answersCount'>,
): boolean => question.text.trim().length > 0 && question.answersCount > 0

export const isQuizReady = (
  questions: Pick<Question, 'text' | 'answersCount'>[],
): boolean => questions.length > 0 && questions.every(isQuestionReady)
