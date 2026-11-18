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

export const toQuestionFormValues = (
  question: Pick<Question, 'text' | 'img'>,
  answers: Pick<AcceptedAnswer, 'text'>[]
): QuestionFormValues => ({
  text: question.text,
  img: question.img ?? '',
  answers: answers.map(({ text }) => ({ answerText: text })),
})

export const toQuestionPayload = (
  values: QuestionFormValues,
  { id, gameId }: Pick<Question, 'id' | 'gameId'>
): Question => ({
  id,
  gameId,
  text: values.text,
  img: values.img || null,
})

export const toAcceptedAnswersPayload = (
  values: QuestionFormValues,
  questionId: string
): RawAcceptedAnswer[] =>
  values.answers.map(({ answerText }) => ({ text: answerText, questionId }))
