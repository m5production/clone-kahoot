import { useActiveGame } from '@/entities/active-game'
import { Players } from '@/entities/player'
import { QuestionView } from '@/entities/question'
import { SubmitAnswerForm } from '@/features/active-game/submit-answer'
import { Card, CardContent } from '@/shared/ui'

export function PlayerGamePage() {
  const { activeQuestion, players, playerAnswers } = useActiveGame()

  return (
    <div className="flex flex-col min-h-full">
      <section className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        {activeQuestion && (
          <QuestionView text={activeQuestion.text} img={activeQuestion.img} />
        )}
        <Card className="w-full max-w-md rounded-3xl border-0 shadow-xl">
          <CardContent>
            <SubmitAnswerForm />
          </CardContent>
        </Card>
      </section>
      <Players
        activeQuestionId={activeQuestion?.id}
        players={players}
        className="bg-primary text-primary-foreground p-4 min-h-52"
        playerAnswers={playerAnswers}
      />
    </div>
  )
}
