import type {
  AcceptedAnswer,
  RawAcceptedAnswer,
} from '@/entities/accepted-answer'
import type { Question } from '@/entities/question'

export interface QuestionFormValues {
  text: string
  img: string
  answers: { answerText: string }[]
}

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  text: '',
  img: '',
  answers: [{ answerText: '' }],
}

/** A question without accepted answers yet (e.g. a new one) gets one empty answer field to fill */
export const toQuestionFormValues = (
  question: Pick<Question, 'text' | 'img'>,
  answers: Pick<AcceptedAnswer, 'text'>[],
): QuestionFormValues => ({
  text: question.text,
  img: question.img ?? '',
  answers: answers.length
    ? answers.map(({ text }) => ({ answerText: text }))
    : EMPTY_QUESTION_FORM.answers,
})

export const toQuestionPayload = (
  values: QuestionFormValues,
  { id }: Pick<Question, 'id'>,
): Pick<Question, 'id' | 'text' | 'img'> => ({
  id,
  text: values.text,
  img: values.img || null,
})

export const toAcceptedAnswersPayload = (
  values: QuestionFormValues,
  questionId: string,
): RawAcceptedAnswer[] =>
  values.answers.map(({ answerText }) => ({ text: answerText, questionId }))
