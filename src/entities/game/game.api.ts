import { httpClient } from '@/shared/api'
import type { Game } from './game.types'

export const fetchGames = async () => {
  const { data } = await httpClient.get<Game[]>('/games')

  return data
}

export const createGame = async () => {
  const { data } = await httpClient.post<Game>('/games')

  return data
}

export const checkActiveGame = async (gameId: string) => {
  await httpClient.get(`/active-game/${gameId}`)
}
