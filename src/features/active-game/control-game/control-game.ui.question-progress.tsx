import { useActiveGame } from '@/entities/active-game'

/** Strict order (BR-60): the host can not pick a question, only see progress */
export function QuestionProgress() {
  const { session } = useActiveGame()

  const players = session?.players ?? []
  const answered = players.filter(({ answered }) => answered).length

  return (
    <div data-testid="question-progress" className="flex flex-col gap-1">
      <h3 className="font-bold text-lg">Progress</h3>
      <p data-testid="question-progress-text" className="text-muted-foreground">
        {session?.question
          ? `Question ${session.question.number} of ${session.question.total}`
          : 'Lobby'}
      </p>
      {session?.state === 'question_open' && (
        <p data-testid="answers-progress" className="text-muted-foreground">
          {answered} of {players.length} answered
        </p>
      )}
    </div>
  )
}
