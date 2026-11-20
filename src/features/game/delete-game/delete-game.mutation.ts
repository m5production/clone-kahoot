import { useMutation } from '@tanstack/react-query'
import { deleteGame, GAMES_QUERY } from '@/entities/game'
import { notifyApiError } from '@/shared/api'

export const useDeleteGameMutation = (onDeleted?: () => void) =>
  useMutation({
    mutationFn: deleteGame,
    onSuccess: () => {
      GAMES_QUERY.invalidate()
      onDeleted?.()
    },
    onError: notifyApiError,
  })
