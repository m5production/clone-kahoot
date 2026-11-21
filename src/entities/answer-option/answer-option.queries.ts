import { queryOptions, skipToken } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { notifyApiError, queryClient } from '@/shared/api'
import { fetchAnswerOptions } from './answer-option.api'

const fetchAnswerOptionsOrNull = async (questionId: string) => {
  try {
    return await fetchAnswerOptions(questionId)
  } catch (error) {
    if (!isAxiosError(error)) throw error

    notifyApiError(error)

    return null
  }
}

export const ANSWER_OPTIONS_QUERY = {
  queryKey: (questionId: string | undefined) =>
    ['answer-options', questionId] as const,
  queryOptions: (questionId: string | undefined) =>
    queryOptions({
      queryKey: ANSWER_OPTIONS_QUERY.queryKey(questionId),
      queryFn: questionId
        ? () => fetchAnswerOptionsOrNull(questionId)
        : skipToken,
    }),
  invalidate: (questionId: string) =>
    queryClient.invalidateQueries({
      queryKey: ANSWER_OPTIONS_QUERY.queryKey(questionId),
    }),
}
