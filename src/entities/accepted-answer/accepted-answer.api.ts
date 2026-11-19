import { httpClient } from '@/shared/api'
import type { AcceptedAnswer, RawAcceptedAnswer } from './accepted-answer.types'

export const fetchAcceptedAnswers = async (questionId: string) => {
  const { data } = await httpClient.get<AcceptedAnswer[]>('/accepted-answers', {
    params: { questionId },
  })

  return data
}

export const replaceAcceptedAnswers = async (
  questionId: string,
  answers: RawAcceptedAnswer[],
) => {
  const { data } = await httpClient.put<AcceptedAnswer[]>(
    '/accepted-answers/',
    answers.map(({ text }) => ({ text })),
    { params: { questionId } },
  )

  return data
}

export const deleteAcceptedAnswers = async (questionId: string) => {
  const { data } = await httpClient.delete<{ count: number }>(
    '/accepted-answers',
    { params: { questionId } },
  )

  return data
}
