import { useState } from 'react'
import { Link } from 'react-router'
import { useActiveGame } from '@/entities/active-game'
import { cn } from '@/shared/lib'
import { Button, buttonVariants } from '@/shared/ui'

const COPY_CONFIRMATION_MS = 3000

type Props = {
  gameId: string
  isWinnersShown: boolean
  onWinnersShown: () => void
}

export function HostControls({
  gameId,
  isWinnersShown,
  onWinnersShown,
}: Props) {
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
        className="whitespace-normal h-auto w-full"
        onClick={handleCopyLinkClick}
      >
        Copy link for the players
      </Button>
      {isCopyConfirmationShown && (
        <p className="text-sm text-muted-foreground">
          Link for the players has been copied to your clipboard
        </p>
      )}

      <Button
        data-testid="show-answers-button"
        variant="secondary"
        className="w-full"
        type="button"
        onClick={handleShowAnswersClick}
      >
        Show answers
      </Button>

      <Button
        data-testid="show-winners-button"
        variant="secondary"
        className="whitespace-normal h-auto w-full"
        type="button"
        onClick={handleShowWinnersClick}
        disabled={isWinnersShown}
      >
        End Quiz and show winners
      </Button>

      <Button
        data-testid="stop-game-button"
        variant="outline"
        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={!isWinnersShown}
        onClick={handleStopQuizClick}
      >
        Stop Quiz
      </Button>

      {isWinnersShown && (
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
