import { queryOptions, skipToken } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { notifyApiError, queryClient } from '@/shared/api'
import { fetchAcceptedAnswers } from './accepted-answer.api'

const fetchAcceptedAnswersOrNull = async (questionId: string) => {
  try {
    return await fetchAcceptedAnswers(questionId)
  } catch (error) {
    if (!isAxiosError(error)) throw error

    notifyApiError(error)

    return null
  }
}

export const ACCEPTED_ANSWERS_QUERY = {
  queryKey: (questionId: string | undefined) =>
    ['accepted-answers', questionId] as const,
  queryOptions: (questionId: string | undefined) =>
    queryOptions({
      queryKey: ACCEPTED_ANSWERS_QUERY.queryKey(questionId),
      queryFn: questionId
        ? () => fetchAcceptedAnswersOrNull(questionId)
        : skipToken,
    }),
  invalidate: (questionId: string) =>
    queryClient.invalidateQueries({
      queryKey: ACCEPTED_ANSWERS_QUERY.queryKey(questionId),
    }),
}
