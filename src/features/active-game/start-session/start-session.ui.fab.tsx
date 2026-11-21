import { Play } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { buildJoinPath } from '@/entities/active-game'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { useStartSessionMutation } from './start-session.mutation'

export const QUIZ_NOT_READY_REASON =
  'You need to fill question text and provide accepted answers to all the questions'

/** D-11, FR-91: an extended FAB above the bottom nav on narrow screens. A tap on
    the not-ready button stays enabled (`aria-disabled`, not `disabled`) so it can
    explain why the quiz cannot start — a `title` tooltip is unreachable on touch */
export function StartSessionFab({
  gameId,
  isReady,
  className,
}: {
  gameId: string
  isReady: boolean
  className?: string
}) {
  const navigate = useNavigate()
  const { mutate: startSession, isPending } = useStartSessionMutation(
    (sessionId) => navigate(buildJoinPath(sessionId)),
  )

  return (
    <Button
      data-testid={isReady ? 'start-session-button' : 'start-game-button'}
      size="lg"
      aria-disabled={!isReady || undefined}
      disabled={isReady && isPending}
      className={cn(
        'h-12 rounded-full px-5 font-bold shadow-lg',
        !isReady && 'opacity-60',
        className,
      )}
      onClick={() =>
        isReady ? startSession(gameId) : toast(QUIZ_NOT_READY_REASON)
      }
    >
      <Play />
      Start this quiz
    </Button>
  )
}
