import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { GAME_QUERY } from '@/entities/game'
import { cn } from '@/shared/lib'
import { Button, Input } from '@/shared/ui'
import { useRenameGameMutation } from './rename-game.mutation'

interface RenameGameValues {
  title: string
}

export function RenameGameTitle({
  gameId,
  className,
}: {
  gameId: string
  /** extra classes for the title, e.g. `truncate` on narrow screens (FR-92) */
  className?: string
}) {
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
        className="min-w-0 max-w-full text-left"
        onClick={handleEditClick}
      >
        <h1 className={cn('text-2xl font-extrabold tracking-tight', className)}>
          {game?.title}
        </h1>
      </button>
    )
  }

  return (
    <form
      data-testid="rename-game-form"
      className="flex max-w-full flex-wrap items-start gap-2"
      onSubmit={handleSubmit(handleRename)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Input
          data-testid="game-title-input"
          className="h-10 w-72 max-w-full text-xl font-bold"
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
