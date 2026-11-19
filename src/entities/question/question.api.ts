import { httpClient } from '@/shared/api'
import type { Question, RawQuestion } from './question.types'

export const fetchQuestionsByGameId = async (gameId: string) => {
  const { data } = await httpClient.get<Question[]>('/questions', {
    params: { gameId },
  })

  return data
}

export const fetchQuestionById = async (questionId: string) => {
  const { data } = await httpClient.get<Question>(`/questions/${questionId}`)

  return data
}

export const createQuestion = async (rawQuestion: RawQuestion) => {
  const { data } = await httpClient.post<Question>('/questions', rawQuestion)

  return data
}

export const updateQuestion = async ({
  id,
  text,
  img,
}: Pick<Question, 'id' | 'text' | 'img'>) => {
  const { data } = await httpClient.put<Question>(`/questions/${id}`, {
    text,
    img,
  })

  return data
}

export const deleteQuestion = async (questionId: string) => {
  const { data } = await httpClient.delete<Question>(`/questions/${questionId}`)

  return data
}
