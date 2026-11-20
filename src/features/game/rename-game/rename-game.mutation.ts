import { useMutation } from '@tanstack/react-query'
import { GAME_QUERY, GAMES_QUERY, renameGame } from '@/entities/game'
import { notifyApiError } from '@/shared/api'

export const useRenameGameMutation = () =>
  useMutation({
    mutationFn: renameGame,
    onSuccess: (game) => {
      GAME_QUERY.invalidate(game.id)
      GAMES_QUERY.invalidate()
    },
    onError: notifyApiError,
  })
