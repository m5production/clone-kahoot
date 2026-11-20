import { httpClient } from '@/shared/api'
import type { SessionSummary } from './active-game.types'

export const createSession = async (gameId: string) => {
  const { data } = await httpClient.post<{
    sessionId: string
    joinPath: string
  }>(`/games/${gameId}/sessions`)

  return data
}

export const fetchSessionSummary = async (sessionId: string) => {
  const { data } = await httpClient.get<SessionSummary>(
    `/sessions/${sessionId}`,
  )

  return data
}
