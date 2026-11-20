import type {
  AcceptedAnswer,
  RawAcceptedAnswer,
} from '@/entities/accepted-answer'
import type { Question } from '@/entities/question'

export interface QuestionFormValues {
  text: string
  img: string
  /** one of '10' | '20' | '30' | '60' | '90' | '120' — the select value */
  timeLimitSec: string
  answers: { answerText: string }[]
}

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  text: '',
  img: '',
  timeLimitSec: '20',
  answers: [{ answerText: '' }],
}

/** A question without accepted answers yet (e.g. a new one) gets one empty answer field to fill */
export const toQuestionFormValues = (
  question: Pick<Question, 'text' | 'img' | 'timeLimitSec'>,
  answers: Pick<AcceptedAnswer, 'text'>[],
): QuestionFormValues => ({
  text: question.text,
  img: question.img ?? '',
  timeLimitSec: String(question.timeLimitSec ?? 20),
  answers: answers.length
    ? answers.map(({ text }) => ({ answerText: text }))
    : EMPTY_QUESTION_FORM.answers,
})

export const toQuestionPayload = (
  values: QuestionFormValues,
  { id }: Pick<Question, 'id'>,
): Pick<Question, 'id' | 'text' | 'img' | 'timeLimitSec'> => ({
  id,
  text: values.text,
  img: values.img || null,
  timeLimitSec: Number(values.timeLimitSec),
})

export const toAcceptedAnswersPayload = (
  values: QuestionFormValues,
  questionId: string,
): RawAcceptedAnswer[] =>
  values.answers.map(({ answerText }) => ({ text: answerText, questionId }))

const normalizeAnswer = (text: string) => text.trim().toLowerCase()

/** FR-56/BR-47: indexes of answer fields duplicating an earlier field after normalization */
export const duplicateAnswerIndexes = (
  values: QuestionFormValues,
): number[] => {
  const seen = new Set<string>()
  const duplicates: number[] = []
  values.answers.forEach(({ answerText }, index) => {
    const normalized = normalizeAnswer(answerText)
    if (!normalized) return
    if (seen.has(normalized)) {
      duplicates.push(index)
    } else {
      seen.add(normalized)
    }
  })
  return duplicates
}
