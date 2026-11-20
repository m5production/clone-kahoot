import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/shared/ui'
import { useDeleteGameMutation } from './delete-game.mutation'

type Props = {
  gameId: string
  title: string
}

/** FR-52: quiz deletion needs a confirmation step (US-18) */
export function DeleteGameButton({ gameId, title }: Props) {
  const [confirming, setConfirming] = useState(false)
  const { mutate: deleteGame, isPending } = useDeleteGameMutation(() =>
    toast.success('Quiz deleted successfully'),
  )

  if (confirming) {
    return (
      <span className="flex shrink-0 gap-1">
        <Button
          data-testid="confirm-delete-button"
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => deleteGame(gameId)}
        >
          Delete
        </Button>
        <Button
          data-testid="cancel-delete-button"
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </span>
    )
  }

  return (
    <Button
      data-testid="delete-button"
      size="sm"
      variant="ghost"
      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
      title={`Delete "${title}"`}
      onClick={() => setConfirming(true)}
    >
      Delete
    </Button>
  )
}
