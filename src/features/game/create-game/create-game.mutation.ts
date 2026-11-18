import { useMutation } from '@tanstack/react-query'
import { notifyApiError } from '@/shared/api'
import { createGame, GAMES_QUERY, type Game } from '@/entities/game'

export const useCreateGameMutation = (onCreated: (game: Game) => void) =>
  useMutation({
    mutationFn: createGame,
    onSuccess: (game) => {
      GAMES_QUERY.invalidate()
      onCreated(game)
    },
    onError: notifyApiError,
  })
