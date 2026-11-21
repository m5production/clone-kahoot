import type {
  AcceptedAnswer,
  RawAcceptedAnswer,
} from '@/entities/accepted-answer'
import type { AnswerOption, RawAnswerOption } from '@/entities/answer-option'
import type { Question, QuestionType } from '@/entities/question'

export interface QuestionFormValues {
  text: string
  img: string
  /** one of '10' | '20' | '30' | '60' | '90' | '120' — the select value */
  timeLimitSec: string
  /** D-10: 'open' — accepted answers below, 'choice' — options below */
  type: QuestionType
  answers: { answerText: string }[]
  options: { optionText: string; isCorrect: boolean }[]
}

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  text: '',
  img: '',
  timeLimitSec: '20',
  type: 'open',
  answers: [{ answerText: '' }],
  options: [
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
  ],
}

/** A question without stored rows gets the minimal empty fields for its type —
    one answer field for 'open', two option fields for 'choice' */
export const toQuestionFormValues = (
  question: Pick<Question, 'text' | 'img' | 'timeLimitSec' | 'type'>,
  answers: Pick<AcceptedAnswer, 'text'>[],
  options: Pick<AnswerOption, 'text' | 'isCorrect'>[],
): QuestionFormValues => ({
  text: question.text,
  img: question.img ?? '',
  timeLimitSec: String(question.timeLimitSec ?? 20),
  type: question.type ?? 'open',
  answers: answers.length
    ? answers.map(({ text }) => ({ answerText: text }))
    : EMPTY_QUESTION_FORM.answers,
  options: options.length
    ? options.map(({ text, isCorrect }) => ({ optionText: text, isCorrect }))
    : EMPTY_QUESTION_FORM.options,
})

export const toQuestionPayload = (
  values: QuestionFormValues,
  { id }: Pick<Question, 'id'>,
): Pick<Question, 'id' | 'text' | 'img' | 'timeLimitSec' | 'type'> => ({
  id,
  text: values.text,
  img: values.img || null,
  timeLimitSec: Number(values.timeLimitSec),
  type: values.type,
})

export const toAcceptedAnswersPayload = (
  values: QuestionFormValues,
  questionId: string,
): RawAcceptedAnswer[] =>
  values.answers.map(({ answerText }) => ({ text: answerText, questionId }))

export const toAnswerOptionsPayload = (
  values: QuestionFormValues,
): RawAnswerOption[] =>
  values.options.map(({ optionText, isCorrect }) => ({
    text: optionText,
    isCorrect,
  }))

const normalizeAnswer = (text: string) => text.trim().toLowerCase()

/** indexes of fields that repeat an earlier non-blank text after normalization */
const duplicateIndexes = (texts: string[]): number[] => {
  const seen = new Set<string>()
  const duplicates: number[] = []
  texts.forEach((text, index) => {
    const normalized = normalizeAnswer(text)
    if (!normalized) return
    if (seen.has(normalized)) {
      duplicates.push(index)
    } else {
      seen.add(normalized)
    }
  })
  return duplicates
}

/** FR-56/BR-47: indexes of answer fields duplicating an earlier field after normalization */
export const duplicateAnswerIndexes = (values: QuestionFormValues): number[] =>
  duplicateIndexes(values.answers.map(({ answerText }) => answerText))

/** FR-100/BR-86: indexes of option fields duplicating an earlier option after normalization */
export const duplicateOptionIndexes = (values: QuestionFormValues): number[] =>
  duplicateIndexes(values.options.map(({ optionText }) => optionText))
