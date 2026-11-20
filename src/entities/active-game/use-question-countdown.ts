import { useEffect, useState } from 'react'
import { useActiveGame } from './active-game.context'

const TICK_MS = 200

/**
 * Remaining milliseconds of the open question, counted down in server time:
 * `remaining = question.endsAt - (Date.now() + clockOffset)` (NFR-P6).
 * Returns `null` when no question is open, `0` once the time is up.
 */
export function useQuestionCountdown(): number | null {
  const { session, clockOffset } = useActiveGame()
  const endsAt =
    session?.state === 'question_open' ? session.question?.endsAt : null

  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (endsAt == null) {
      setRemaining(null)
      return
    }

    const tick = () =>
      setRemaining(Math.max(endsAt - (Date.now() + clockOffset), 0))

    tick()
    const timer = setInterval(tick, TICK_MS)
    return () => clearInterval(timer)
  }, [endsAt, clockOffset])

  return remaining
}
