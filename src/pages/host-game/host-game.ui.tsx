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
    <section className="grid grid-cols-[200px_1fr_200px] h-full grid-rows-[1fr_200px]">
      <aside className="bg-orange-300 text-blue-600 p-4 h-full row-span-full flex flex-col gap-4">
        <h3 className="font-bold text-xl">Questions</h3>
        <QuestionSwitcher />
      </aside>

      <aside className="col-start-3 row-span-full bg-pink-400 p-4">
        <h3 className="font-bold text-xl mb-6">Controls</h3>
        <HostControls
          gameId={gameId}
          isWinnersShown={isWinnersShown}
          onWinnersShown={() => setIsWinnersShown(true)}
        />
      </aside>

      {isWinnersShown ? (
        <WinnersTable
          className="col-start-2 row-span-full"
          winners={standings ?? []}
        />
      ) : (
        <>
          <div className="p-4">
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
            className="col-start-2 col-span-1 bg-purple-400 p-4"
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
