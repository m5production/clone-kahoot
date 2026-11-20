import { useState } from 'react'
import { Link } from 'react-router'
import { useActiveGame } from '@/entities/active-game'
import { cn } from '@/shared/lib'
import { Button, buttonVariants } from '@/shared/ui'

const CONFIRM_END_MS = 3000

type ControlMessage =
  | 'START_GAME'
  | 'NEXT_QUESTION'
  | 'CLOSE_QUESTION'
  | 'SHOW_ANSWERS'
  | 'SHOW_WINNERS'
  | 'END_SESSION'

export function HostControls() {
  const { session, endReason, sendMessage } = useActiveGame()
  const [isEndConfirming, setIsEndConfirming] = useState(false)

  const state = session?.state
  const question = session?.question
  const isLastQuestion =
    question !== null &&
    question !== undefined &&
    question.number === question.total

  const send = (type: ControlMessage) => sendMessage?.({ type, payload: null })

  const handleEndSessionClick = () => {
    // FR-70: ending the session needs a confirmation click
    if (!isEndConfirming) {
      setIsEndConfirming(true)
      setTimeout(() => setIsEndConfirming(false), CONFIRM_END_MS)
      return
    }
    setIsEndConfirming(false)
    send('END_SESSION')
  }

  return (
    <div data-testid="host-controls" className="flex flex-col gap-4">
      {state === 'lobby' && (
        <Button
          data-testid="start-game-button"
          className="w-full font-bold"
          type="button"
          onClick={() => send('START_GAME')}
        >
          Start the game
        </Button>
      )}

      {state === 'question_open' && (
        <Button
          data-testid="close-question-button"
          variant="secondary"
          className="w-full"
          type="button"
          onClick={() => send('CLOSE_QUESTION')}
        >
          Close the question
        </Button>
      )}

      {state === 'question_closed' && (
        <Button
          data-testid="show-answers-button"
          variant="secondary"
          className="w-full"
          type="button"
          onClick={() => send('SHOW_ANSWERS')}
        >
          Show answers
        </Button>
      )}

      {state === 'answers_shown' &&
        (isLastQuestion ? (
          <Button
            data-testid="show-winners-button"
            variant="secondary"
            className="w-full"
            type="button"
            onClick={() => send('SHOW_WINNERS')}
          >
            Show winners
          </Button>
        ) : (
          <Button
            data-testid="next-question-button"
            variant="secondary"
            className="w-full"
            type="button"
            onClick={() => send('NEXT_QUESTION')}
          >
            Next question
          </Button>
        ))}

      {!endReason && (
        <Button
          data-testid="end-session-button"
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleEndSessionClick}
        >
          {isEndConfirming ? 'Confirm: end the session?' : 'End the session'}
        </Button>
      )}

      {endReason && (
        <Link
          data-testid="home-link"
          className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
          to="/home"
        >
          Home
        </Link>
      )}
    </div>
  )
}
