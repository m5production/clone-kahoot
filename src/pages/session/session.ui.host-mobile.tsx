import { ChevronDown, QrCode, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useActiveGame } from '@/entities/active-game'
import { PlayerAnswersList, PlayersList } from '@/entities/player'
import { QuestionView } from '@/entities/question'
import {
  HostControls,
  InviteLink,
  QuestionProgress,
} from '@/features/active-game/control-game'
import { cn } from '@/shared/lib'
import { Button, Card, CardContent } from '@/shared/ui'
import { QuestionTimer } from './session.ui.question-timer'

/** FR-93, D-12: the "stage" layout of the host game screen below 768px — a
    compact progress header, the question and the timer in the centre, a
    collapsible players panel and the current action pinned to the bottom */
export function HostScreenMobile() {
  const { session, revealed } = useActiveGame()
  const [isPlayersOpen, setIsPlayersOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const state = session?.state
  const question = session?.question ?? null
  const players = session?.players ?? []
  // FR-96: revealed answers are the key state info — they go to the content
  // area, not into the collapsible panel
  const answers = state === 'answers_shown' ? revealed?.answers : null

  return (
    <section className="flex min-h-full flex-col">
      {/* the quiz title is dropped in favour of the one-line progress (D-12);
          the invite stays reachable in every game state (BR-57) */}
      <header className="flex min-h-14 items-center gap-2 border-b bg-card px-4 py-1">
        <div className="min-w-0 flex-1">
          <QuestionProgress compact />
        </div>
        <Button
          data-testid="invite-open-button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          aria-label="Invite players"
          onClick={() => setIsInviteOpen(true)}
        >
          <QrCode />
        </Button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <QuestionTimer />
        {question && <QuestionView text={question.text} img={question.img} />}
        {answers && (
          <PlayerAnswersList answers={answers} className="justify-center" />
        )}
      </div>

      {/* FR-95: collapsed to the "Players (N)" header by default; during an
          open question the list marks who already answered */}
      <section
        data-testid="players-panel"
        className="bg-primary text-primary-foreground"
      >
        <button
          type="button"
          data-testid="players-toggle-button"
          aria-expanded={isPlayersOpen}
          onClick={() => setIsPlayersOpen((isOpen) => !isOpen)}
          className="flex min-h-11 w-full items-center gap-2 px-4 py-2 font-bold"
        >
          <ChevronDown
            className={cn(
              'transition-transform',
              isPlayersOpen && 'rotate-180',
            )}
          />
          Players ({players.length})
        </button>
        {isPlayersOpen && (
          <PlayersList
            players={players}
            showAnswered={state === 'question_open'}
            className="px-4 pb-4"
          />
        )}
      </section>

      {/* FR-94: the same contextual action as the desktop HostControls plus
          "End the session"; pinned above the home-indicator area */}
      <div className="sticky bottom-0 border-t bg-card p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <HostControls horizontal />
      </div>

      {isInviteOpen && <InviteOverlay onClose={() => setIsInviteOpen(false)} />}
    </section>
  )
}

/** FR-97: the invite link and QR in a light overlay — no dialog primitive in
    shared/ui yet; closes on the backdrop, the close button or Escape */
function InviteOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the backdrop is a click-to-dismiss overlay, keyboard dismissal is on Escape
    <div
      data-testid="invite-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Invitation link"
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">Invite the players</h2>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 -mr-2"
              aria-label="Close"
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
          <InviteLink />
        </CardContent>
      </Card>
    </div>
  )
}
