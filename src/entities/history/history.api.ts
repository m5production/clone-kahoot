import { httpClient } from '@/shared/api'
import type { HistoryEntry, SessionReport } from './history.types'

export const fetchHistory = async (gameId?: string) => {
  const { data } = await httpClient.get<HistoryEntry[]>('/sessions', {
    params: gameId ? { gameId } : {},
  })

  return data
}

export const fetchSessionReport = async (sessionId: string) => {
  const { data } = await httpClient.get<SessionReport>(
    `/sessions/${sessionId}/report`,
  )

  return data
}

export const deleteSessionRecord = async (sessionId: string) => {
  await httpClient.delete(`/sessions/${sessionId}`)
}
