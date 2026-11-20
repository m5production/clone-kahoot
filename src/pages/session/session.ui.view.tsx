import { Link } from 'react-router'
import { useActiveGame, useQuestionCountdown } from '@/entities/active-game'
import { Players, WinnersTable } from '@/entities/player'
import { QuestionView } from '@/entities/question'
import {
  HostControls,
  InviteLink,
  QuestionProgress,
} from '@/features/active-game/control-game'
import { SubmitAnswerForm } from '@/features/active-game/submit-answer'
import { cn } from '@/shared/lib'
import { buttonVariants, Card, CardContent } from '@/shared/ui'

export function SessionView() {
  const { role, session, endReason, standings } = useActiveGame()

  if (endReason || standings) return <SessionEnded />
  if (!session) {
    return (
      <section className="min-h-full flex items-center justify-center">
        <p className="text-muted-foreground">Connecting to the session…</p>
      </section>
    )
  }
  if (session.state === 'lobby') return <Lobby />

  return role === 'host' ? <HostScreen /> : <PlayerScreen />
}

function Lobby() {
  const { role, session } = useActiveGame()

  return (
    <section className="min-h-full flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-primary to-primary-deep p-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-primary-foreground drop-shadow-sm">
        {session?.quizTitle}
      </h1>

      <Card className="w-full max-w-md rounded-3xl border-0 shadow-2xl">
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="text-xl font-bold">Lobby</h2>
          <Players
            players={session?.players ?? []}
            playerAnswers={null}
            className="text-left"
          />
          {role === 'host' ? (
            <>
              <InviteLink />
              <HostControls />
            </>
          ) : (
            <p className="text-muted-foreground">
              Waiting for the host to start the game…
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

function HostScreen() {
  const { session, revealed } = useActiveGame()
  const question = session?.question ?? null
  const answers = session?.state === 'answers_shown' ? revealed?.answers : null

  return (
    <section className="grid grid-cols-[240px_1fr_240px] min-h-full grid-rows-[1fr_auto]">
      <aside className="bg-card border-r p-4 h-full row-span-full flex flex-col gap-4">
        <QuestionProgress />
      </aside>

      <aside className="col-start-3 row-span-full bg-card border-l p-4 flex flex-col gap-4">
        <h3 className="font-bold text-lg mb-2">Controls</h3>
        <InviteLink />
        <HostControls />
      </aside>

      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <QuestionTimer />
        {question && <QuestionView text={question.text} img={question.img} />}
      </div>

      <Players
        showAnswered={session?.state === 'question_open'}
        players={session?.players ?? []}
        className="col-start-2 col-span-1 bg-primary text-primary-foreground p-4"
        playerAnswers={answers ?? null}
      />
    </section>
  )
}

function PlayerScreen() {
  const { session, revealed } = useActiveGame()
  const question = session?.question ?? null
  const state = session?.state

  return (
    <div className="flex flex-col min-h-full">
      <section className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        {session && !session.hostConnected && (
          <p data-testid="host-away-message" className="text-muted-foreground">
            The host is away — the game will continue when they come back
          </p>
        )}
        {question && <QuestionView text={question.text} img={question.img} />}
        <QuestionTimer />

        {state === 'question_open' && (
          <Card className="w-full max-w-md rounded-3xl border-0 shadow-xl">
            <CardContent>
              <SubmitAnswerForm />
            </CardContent>
          </Card>
        )}

        {state === 'question_closed' && (
          <p className="text-muted-foreground">
            The question is closed — waiting for the answers…
          </p>
        )}

        {state === 'answers_shown' && revealed && (
          <Card className="w-full max-w-md rounded-3xl border-0 shadow-xl">
            <CardContent className="flex flex-col gap-3 p-6">
              <h3 className="font-bold">Accepted answers</h3>
              <p data-testid="accepted-answers">
                {revealed.acceptedAnswers.join(', ')}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <Players
        players={session?.players ?? []}
        className="bg-primary text-primary-foreground p-4 min-h-52"
        playerAnswers={
          state === 'answers_shown' ? (revealed?.answers ?? null) : null
        }
      />
    </div>
  )
}

/** Remaining seconds of the open question in server time; hidden outside question_open (BR-61, NFR-P6) */
function QuestionTimer() {
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

const END_REASON_TEXT: Record<string, string> = {
  finished: 'The game has finished',
  host_ended: 'The host ended the session',
  host_timeout: 'The host did not come back — the session was aborted',
}

function SessionEnded() {
  const { endReason, standings } = useActiveGame()

  return (
    <section className="min-h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-primary to-primary-deep p-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-primary-foreground drop-shadow-sm">
        {standings ? 'Winners' : 'Game over'}
      </h1>

      <Card className="w-full max-w-md rounded-3xl border-0 shadow-2xl">
        <CardContent className="p-0">
          {standings ? (
            <WinnersTable className="p-4" winners={standings} />
          ) : (
            <p
              data-testid="session-ended-reason"
              className="p-6 text-muted-foreground"
            >
              {END_REASON_TEXT[endReason ?? 'host_ended']}
            </p>
          )}
        </CardContent>
      </Card>

      <Link
        data-testid="home-link"
        className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}
        to="/home"
      >
        Home
      </Link>
    </section>
  )
}
