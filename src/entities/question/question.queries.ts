import { queryOptions, skipToken } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { notifyApiError, queryClient } from '@/shared/api'
import { fetchQuestionById, fetchQuestionsByGameId } from './question.api'

const fetchQuestionOrNull = async (questionId: string) => {
  try {
    return await fetchQuestionById(questionId)
  } catch (error) {
    if (!isAxiosError(error)) throw error

    notifyApiError(error)

    return null
  }
}

export const GAME_QUESTIONS_QUERY = {
  queryKey: (gameId: string | undefined) => ['questions', gameId] as const,
  queryOptions: (gameId: string | undefined) =>
    queryOptions({
      queryKey: GAME_QUESTIONS_QUERY.queryKey(gameId),
      queryFn: gameId ? () => fetchQuestionsByGameId(gameId) : skipToken,
    }),
  invalidate: (gameId: string) =>
    queryClient.invalidateQueries({
      queryKey: GAME_QUESTIONS_QUERY.queryKey(gameId),
    }),
}

export const QUESTION_QUERY = {
  queryKey: (questionId: string | undefined) =>
    ['question', questionId] as const,
  queryOptions: (questionId: string | undefined) =>
    queryOptions({
      queryKey: QUESTION_QUERY.queryKey(questionId),
      queryFn: questionId ? () => fetchQuestionOrNull(questionId) : skipToken,
    }),
  invalidate: (questionId: string) =>
    queryClient.invalidateQueries({
      queryKey: QUESTION_QUERY.queryKey(questionId),
    }),
}
