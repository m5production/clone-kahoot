import { useNavigate } from 'react-router'
import { Button } from '@/shared/ui'
import { useCreateGameMutation } from './create-game.mutation'

export function CreateGameButton() {
  const navigate = useNavigate()
  const { mutate: createGame } = useCreateGameMutation(({ id }) =>
    navigate(`/${id}/admin`),
  )

  return (
    <Button data-testid="create-game-button" onClick={() => createGame()}>
      + Create new Quiz
    </Button>
  )
}
