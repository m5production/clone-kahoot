import { queryOptions, skipToken } from '@tanstack/react-query'
import { queryClient } from '@/shared/api'
import { fetchHistory, fetchSessionReport } from './history.api'

export const HISTORY_QUERY = {
  queryKey: (gameId?: string) => ['history', gameId ?? 'all'] as const,
  queryOptions: (gameId?: string) =>
    queryOptions({
      queryKey: HISTORY_QUERY.queryKey(gameId),
      queryFn: () => fetchHistory(gameId),
    }),
  invalidate: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
}

export const SESSION_REPORT_QUERY = {
  queryKey: (sessionId: string | undefined) =>
    ['session-report', sessionId] as const,
  queryOptions: (sessionId: string | undefined) =>
    queryOptions({
      queryKey: SESSION_REPORT_QUERY.queryKey(sessionId),
      queryFn: sessionId ? () => fetchSessionReport(sessionId) : skipToken,
      retry: false,
    }),
}
