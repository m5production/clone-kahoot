import { queryOptions, skipToken } from '@tanstack/react-query'
import { queryClient } from '@/shared/api'
import { fetchSessionSummary } from './active-game.api'

export const SESSION_SUMMARY_QUERY = {
  queryKey: (sessionId: string | undefined) =>
    ['session-summary', sessionId] as const,
  queryOptions: (sessionId: string | undefined) =>
    queryOptions({
      queryKey: SESSION_SUMMARY_QUERY.queryKey(sessionId),
      queryFn: sessionId ? () => fetchSessionSummary(sessionId) : skipToken,
      retry: false,
    }),
  invalidate: (sessionId: string) =>
    queryClient.invalidateQueries({
      queryKey: SESSION_SUMMARY_QUERY.queryKey(sessionId),
    }),
}
