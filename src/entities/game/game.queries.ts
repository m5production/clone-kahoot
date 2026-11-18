import { queryOptions } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { notifyApiError, queryClient } from '@/shared/api'
import { fetchGames } from './game.api'
import type { Game } from './game.types'

const fetchGamesOrEmpty = async (): Promise<Game[]> => {
  try {
    return await fetchGames()
  } catch (error) {
    if (!isAxiosError(error)) throw error

    notifyApiError(error)

    return []
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
