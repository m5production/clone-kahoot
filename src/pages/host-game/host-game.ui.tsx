import { useState } from 'react'
import { useParams } from 'react-router'
import { ActiveGameProvider, useActiveGame } from '@/entities/active-game'
import { Players, WinnersTable } from '@/entities/player'
import { QuestionView } from '@/entities/question'
import {
  HostControls,
  QuestionSwitcher,
} from '@/features/active-game/control-game'

function HostGame({ gameId }: { gameId: string }) {
  const { players, activeQuestion, playerAnswers, standings } = useActiveGame()
  const [isWinnersShown, setIsWinnersShown] = useState(false)

  return (
    <section className="grid grid-cols-[240px_1fr_240px] min-h-full grid-rows-[1fr_auto]">
      <aside className="bg-card border-r p-4 h-full row-span-full flex flex-col gap-4">
        <h3 className="font-bold text-lg">Questions</h3>
        <QuestionSwitcher />
      </aside>

      <aside className="col-start-3 row-span-full bg-card border-l p-4 flex flex-col gap-4">
        <h3 className="font-bold text-lg mb-2">Controls</h3>
        <HostControls
          gameId={gameId}
          isWinnersShown={isWinnersShown}
          onWinnersShown={() => setIsWinnersShown(true)}
        />
      </aside>

      {isWinnersShown ? (
        <WinnersTable
          className="col-start-2 row-span-full w-full max-w-xl mx-auto self-center"
          winners={standings ?? []}
        />
      ) : (
        <>
          <div className="flex items-center justify-center p-8">
            {activeQuestion && (
              <QuestionView
                text={activeQuestion.text}
                img={activeQuestion.img}
              />
            )}
          </div>

          <Players
            activeQuestionId={activeQuestion?.id}
            players={players}
            className="col-start-2 col-span-1 bg-primary text-primary-foreground p-4"
            playerAnswers={playerAnswers}
          />
        </>
      )}
    </section>
  )
}

export function HostGamePage() {
  const { gameId } = useParams()

  if (!gameId) {
    return null
  }

  return (
    <ActiveGameProvider role="host" gameId={gameId}>
      <HostGame gameId={gameId} />
    </ActiveGameProvider>
  )
}
