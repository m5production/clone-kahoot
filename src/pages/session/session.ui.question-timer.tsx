import { useQuestionCountdown } from '@/entities/active-game'
import { cn } from '@/shared/lib'

/** Remaining seconds of the open question in server time; hidden outside question_open (BR-61, NFR-P6) */
export function QuestionTimer() {
  const remaining = useQuestionCountdown()

  if (remaining === null) return null

  const seconds = Math.ceil(remaining / 1000)

  return (
    <p
      data-testid="question-timer"
      className={cn(
        'rounded-full px-4 py-1 text-2xl font-extrabold tabular-nums',
        seconds <= 5 ? 'bg-destructive/15 text-destructive' : 'bg-muted',
      )}
    >
      {seconds}
    </p>
  )
}
