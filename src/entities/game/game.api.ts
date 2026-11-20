import { httpClient } from '@/shared/api'
import type { Game, GameSummary } from './game.types'

export const fetchGames = async () => {
  const { data } = await httpClient.get<GameSummary[]>('/games')

  return data
}

export const fetchGameById = async (gameId: string) => {
  const { data } = await httpClient.get<Game>(`/games/${gameId}`)

  return data
}

export const createGame = async (title: string) => {
  const { data } = await httpClient.post<Game>('/games', { title })

  return data
}

export const renameGame = async ({ id, title }: Pick<Game, 'id' | 'title'>) => {
  const { data } = await httpClient.patch<Game>(`/games/${id}`, { title })

  return data
}

export const deleteGame = async (gameId: string) => {
  const { data } = await httpClient.delete<Game>(`/games/${gameId}`)

  return data
}

export const reorderQuestions = async (
  gameId: string,
  questionIds: string[],
) => {
  await httpClient.patch(`/games/${gameId}/questions/reorder`, { questionIds })
}

export const checkActiveGame = async (gameId: string) => {
  await httpClient.get(`/active-game/${gameId}`)
}
