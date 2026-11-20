import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { GAME_QUERY } from '@/entities/game'
import { Button, Input } from '@/shared/ui'
import { useRenameGameMutation } from './rename-game.mutation'

interface RenameGameValues {
  title: string
}

export function RenameGameTitle({ gameId }: { gameId: string }) {
  const { data: game } = useQuery(GAME_QUERY.queryOptions(gameId))
  const { mutate: rename, isPending } = useRenameGameMutation()
  const [editing, setEditing] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenameGameValues>({ defaultValues: { title: '' } })

  const handleEditClick = () => {
    reset({ title: game?.title ?? '' })
    setEditing(true)
  }

  const handleRename = ({ title }: RenameGameValues) =>
    rename(
      { id: gameId, title: title.trim() },
      { onSuccess: () => setEditing(false) },
    )

  if (!editing) {
    return (
      <button
        type="button"
        data-testid="game-title-button"
        title="Rename quiz"
        className="text-left"
        onClick={handleEditClick}
      >
        <h1 className="text-2xl font-extrabold tracking-tight">
          {game?.title}
        </h1>
      </button>
    )
  }

  return (
    <form
      data-testid="rename-game-form"
      className="flex items-start gap-2"
      onSubmit={handleSubmit(handleRename)}
    >
      <div className="flex flex-col gap-1">
        <Input
          data-testid="game-title-input"
          className="h-10 w-72 text-xl font-bold"
          {...register('title', {
            required: 'Enter a quiz title',
            maxLength: {
              value: 80,
              message: 'Quiz title must be at most 80 characters',
            },
            validate: (value) =>
              value.trim().length > 0 || 'Enter a quiz title',
          })}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <Button
        data-testid="game-title-save-button"
        type="submit"
        disabled={isPending}
      >
        Save
      </Button>
      <Button
        data-testid="game-title-cancel-button"
        type="button"
        variant="ghost"
        onClick={() => setEditing(false)}
      >
        Cancel
      </Button>
    </form>
  )
}
