import { useState } from 'react'
import { Link } from 'react-router'
import { cn } from '@/shared/lib'
import { Button, buttonVariants } from '@/shared/ui'
import { useActiveGame } from '@/entities/active-game'

const COPY_CONFIRMATION_MS = 3000

type Props = {
  gameId: string
  isWinnersShown: boolean
  onWinnersShown: () => void
}

export function HostControls({ gameId, isWinnersShown, onWinnersShown }: Props) {
  const { sendMessage, activeQuestion } = useActiveGame()
  const [isCopyConfirmationShown, setIsCopyConfirmationShown] = useState(false)

  const handleCopyLinkClick = () => {
    navigator.clipboard.writeText(gameId)
    setIsCopyConfirmationShown(true)
    setTimeout(() => setIsCopyConfirmationShown(false), COPY_CONFIRMATION_MS)
  }

  const handleShowAnswersClick = () => {
    if (!activeQuestion) return

    sendMessage?.({
      type: 'SHOW_ANSWERS',
      payload: { questionId: activeQuestion.id },
    })
  }

  const handleShowWinnersClick = () => {
    if (!sendMessage) return

    sendMessage({ type: 'SHOW_WINNERS', payload: null })
    onWinnersShown()
  }

  const handleStopQuizClick = () => {
    sendMessage?.({ type: 'END_GAME', payload: null })
  }

  return (
    <div data-testid="host-controls" className="flex flex-col gap-4">
      <Button
        data-testid="copy-game-link-button"
        className="whitespace-normal h-auto"
        onClick={handleCopyLinkClick}
      >
        Copy link for the players
      </Button>
      {isCopyConfirmationShown &&
        'Link for the players has been copied to your clipboard'}

      <Button
        data-testid="show-answers-button"
        type="button"
        onClick={handleShowAnswersClick}
      >
        Show answers
      </Button>

      <Button
        data-testid="show-winners-button"
        className="whitespace-normal h-auto"
        type="button"
        onClick={handleShowWinnersClick}
        disabled={isWinnersShown}
      >
        End Quiz and show winners
      </Button>

      <Button
        data-testid="stop-game-button"
        disabled={!isWinnersShown}
        onClick={handleStopQuizClick}
      >
        Stop Quiz
      </Button>

      {isWinnersShown && (
        <Link data-testid="home-link" className={cn(buttonVariants())} to="/home">
          Home
        </Link>
      )}
    </div>
  )
}
