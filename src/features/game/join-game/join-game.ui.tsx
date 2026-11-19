import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { checkActiveGame } from '@/entities/game'
import { notifyApiError } from '@/shared/api'
import { Button, Input } from '@/shared/ui'

interface JoinGameValues {
  gameId: string
}

export function JoinGameForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinGameValues>({ defaultValues: { gameId: '' } })

  const handleJoinGameSubmit = async ({ gameId }: JoinGameValues) => {
    try {
      await checkActiveGame(gameId)

      navigate(`/${gameId}/player`)
    } catch (error) {
      notifyApiError(error)
    }
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
          {...register('gameId', { required: 'Enter valid game link' })}
          aria-invalid={Boolean(errors.gameId)}
        />
        <Button data-testid="join-game-submit-button" type="submit">
          Join game
        </Button>
      </form>

      {errors.gameId && <p className="text-red-300">{errors.gameId.message}</p>}
    </>
  )
}
