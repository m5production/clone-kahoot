import { queryOptions, skipToken } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { notifyApiError, queryClient } from '@/shared/api'
import { fetchGameById, fetchGames } from './game.api'

const fetchGamesOrEmpty = async () => {
  try {
    return await fetchGames()
  } catch (error) {
    if (!isAxiosError(error)) throw error

    notifyApiError(error)

    return []
  }
}

const fetchGameOrNull = async (gameId: string) => {
  try {
    return await fetchGameById(gameId)
  } catch (error) {
    if (!isAxiosError(error)) throw error

    notifyApiError(error)

    return null
  }
}

export const GAMES_QUERY = {
  queryKey: () => ['games'] as const,
  queryOptions: () =>
    queryOptions({
      queryKey: GAMES_QUERY.queryKey(),
      queryFn: fetchGamesOrEmpty,
      staleTime: Infinity,
    }),
  invalidate: () =>
    queryClient.invalidateQueries({ queryKey: GAMES_QUERY.queryKey() }),
}

export const GAME_QUERY = {
  queryKey: (gameId: string | undefined) => ['game', gameId] as const,
  queryOptions: (gameId: string | undefined) =>
    queryOptions({
      queryKey: GAME_QUERY.queryKey(gameId),
      queryFn: gameId ? () => fetchGameOrNull(gameId) : skipToken,
    }),
  invalidate: (gameId: string) =>
    queryClient.invalidateQueries({ queryKey: GAME_QUERY.queryKey(gameId) }),
}
