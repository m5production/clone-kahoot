import { useNavigate } from 'react-router'
import { buildJoinPath } from '@/entities/active-game'
import { Button } from '@/shared/ui'
import { useStartSessionMutation } from './start-session.mutation'

export function StartSessionButton({ gameId }: { gameId: string }) {
  const navigate = useNavigate()
  const { mutate: startSession, isPending } = useStartSessionMutation(
    (sessionId) => navigate(buildJoinPath(sessionId)),
  )

  return (
    <Button
      data-testid="start-session-button"
      size="lg"
      className="font-bold"
      disabled={isPending}
      onClick={() => startSession(gameId)}
    >
      Start this quiz
    </Button>
  )
}
