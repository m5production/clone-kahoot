import { useActiveGame } from '@/entities/active-game'
import { Players } from '@/entities/player'
import { QuestionView } from '@/entities/question'
import { SubmitAnswerForm } from '@/features/active-game/submit-answer'

export function PlayerGamePage() {
  const { activeQuestion, players, playerAnswers } = useActiveGame()

  return (
    <div className="flex flex-col h-full justify-between">
      <section className="flex flex-col items-center gap-4 p-4">
        {activeQuestion && (
          <QuestionView text={activeQuestion.text} img={activeQuestion.img} />
        )}
        <SubmitAnswerForm />
      </section>
      <Players
        activeQuestionId={activeQuestion?.id}
        players={players}
        className="bg-purple-400 p-4 min-h-52"
        playerAnswers={playerAnswers}
      />
    </div>
  )
}
