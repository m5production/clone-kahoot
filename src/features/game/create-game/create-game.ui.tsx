import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Button, Input } from '@/shared/ui'
import { useCreateGameMutation } from './create-game.mutation'

interface CreateGameValues {
  title: string
}

export function CreateGameForm() {
  const navigate = useNavigate()
  const { mutate: createGame, isPending } = useCreateGameMutation(({ id }) =>
    navigate(`/${id}/admin`),
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGameValues>({ defaultValues: { title: '' } })

  const handleCreate = ({ title }: CreateGameValues) => createGame(title.trim())

  return (
    <div className="flex flex-col gap-2">
      <form
        data-testid="create-game-form"
        className="flex gap-2"
        onSubmit={handleSubmit(handleCreate)}
      >
        <Input
          data-testid="create-game-title-input"
          className="h-11"
          placeholder="New quiz title"
          aria-label="New quiz title"
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
        <Button
          data-testid="create-game-button"
          type="submit"
          size="lg"
          className="shrink-0 font-bold"
          disabled={isPending}
        >
          Create
        </Button>
      </form>
      {errors.title && (
        <p role="alert" className="text-destructive">
          {errors.title.message}
        </p>
      )}
    </div>
  )
}
