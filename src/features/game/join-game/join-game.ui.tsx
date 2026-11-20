import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { buildJoinPath, extractSessionId } from '@/entities/active-game'
import { Button, Input } from '@/shared/ui'

interface JoinGameValues {
  link: string
}

export function JoinGameForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinGameValues>({ defaultValues: { link: '' } })

  const handleJoinGameSubmit = ({ link }: JoinGameValues) => {
    navigate(buildJoinPath(extractSessionId(link)))
  }

  return (
    <>
      <form
        data-testid="join-game-form"
        onSubmit={handleSubmit(handleJoinGameSubmit)}
        className="flex gap-2"
      >
        <Input
          data-testid="join-game-input"
          className="h-11"
          placeholder="Invitation link"
          {...register('link', { required: 'Enter a valid invitation link' })}
          aria-invalid={Boolean(errors.link)}
        />
        <Button
          data-testid="join-game-submit-button"
          type="submit"
          size="lg"
          className="font-bold"
        >
          Join game
        </Button>
      </form>

      {errors.link && <p className="text-destructive">{errors.link.message}</p>}
    </>
  )
}
