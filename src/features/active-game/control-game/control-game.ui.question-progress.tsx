import { useActiveGame } from '@/entities/active-game'

/** Strict order (BR-60): the host can not pick a question, only see progress.
    `compact` is the one-line header variant of the mobile host screen (D-12) */
export function QuestionProgress({ compact = false }: { compact?: boolean }) {
  const { session } = useActiveGame()

  const players = session?.players ?? []
  const answered = players.filter(({ answered }) => answered).length

  const questionText = session?.question
    ? `Question ${session.question.number} of ${session.question.total}`
    : 'Lobby'

  if (compact) {
    return (
      <div
        data-testid="question-progress"
        className="flex min-w-0 items-baseline gap-1.5 text-sm"
      >
        <p data-testid="question-progress-text" className="font-semibold">
          {questionText}
        </p>
        {session?.state === 'question_open' && (
          <>
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <p
              data-testid="answers-progress"
              className="truncate text-muted-foreground"
            >
              {answered} of {players.length} answered
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div data-testid="question-progress" className="flex flex-col gap-1">
      <h3 className="font-bold text-lg">Progress</h3>
      <p data-testid="question-progress-text" className="text-muted-foreground">
        {questionText}
      </p>
      {session?.state === 'question_open' && (
        <p data-testid="answers-progress" className="text-muted-foreground">
          {answered} of {players.length} answered
        </p>
      )}
    </div>
  )
}
