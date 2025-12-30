import { QuestionView } from '@/components/ui/QuestionView'
import { useActiveGame } from '@/lib/useActiveGame'
import { Players } from '@/components/ui/Players'
import { Button, buttonVariants } from '@/components/ui/button'
import { useState } from 'react'
import { WinnersTable } from '@/components/ui/WinnersTable'
import { cn } from '@/lib/utils'
import { Link } from 'react-router'

export function ActiveQuiz({ gameId }: { gameId: string }) {
  const { players, sendMessage, activeQuestion, allQuestions, playerAnswers } =
    useActiveGame()

  const [isShownCopyConfirmation, setIsShownCopyConfirmation] = useState(false)
  const [isShowWinners, setIsShowWinners] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(gameId)

    setIsShownCopyConfirmation(true)

    setTimeout(() => setIsShownCopyConfirmation(false), 3000)
  }

  const handleShowAnswersClick = () => {
    if (!sendMessage) {
      return
    }

    sendMessage({
      type: 'SHOW_ANSWERS',
      payload: { questionId: activeQuestion?.id },
    })
  }

  const handleShowWinners = () => {
    if (!sendMessage) {
      return
    }

    sendMessage({ type: 'SHOW_WINNERS', payload: null })

    setIsShowWinners(true)
  }

  const handleStopQuiz = () => {
    if (sendMessage) sendMessage({ type: 'END_GAME', payload: null })
  }

  return (
    <section className="grid grid-cols-[200px_1fr_200px] h-full grid-rows-[1fr_200px]">
      <aside className="bg-orange-300 text-blue-600 p-4 h-full row-span-full flex flex-col gap-4">
        <h3 className="font-bold text-xl">Questions</h3>

        <ul className="w-full flex flex-col gap-2">
          {allQuestions &&
            allQuestions.map(({ id }, index) => (
              <li key={id} className="w-full">
                <Button
                  onClick={() =>
                    sendMessage!({
                      type: 'CHANGE_QUESTION',
                      payload: { qusetionId: id },
                    })
                  }
                  className={cn(
                    'w-full truncate',
                    activeQuestion?.id === id &&
                    buttonVariants({ variant: 'secondary' })
                  )}
                >
                  Question {index + 1}
                </Button>
              </li>
            ))}
        </ul>
      </aside>

      <aside className="col-start-3 row-span-full bg-pink-400 p-4">
        <h3 className="font-bold text-xl mb-6">Controls</h3>
        <div className="flex flex-col gap-4">
          <Button className="whitespace-normal h-auto" onClick={handleCopyLink}>
            Copy link for the players
          </Button>
          {isShownCopyConfirmation &&
            'Link for the players has been copied to your clipboard'}

          <Button type="button" onClick={handleShowAnswersClick}>
            Show answers
          </Button>

          <Button
            className="whitespace-normal h-auto"
            type="button"
            onClick={handleShowWinners}
            disabled={isShowWinners}
          >
            End Quiz and show winners
          </Button>

          <Button disabled={!isShowWinners} onClick={handleStopQuiz}>
            Stop Quiz
          </Button>

          {isShowWinners && (
            <Link className={cn(buttonVariants())} to="/home">
              Home
            </Link>
          )}
        </div>
      </aside>

      {isShowWinners ? (
        <WinnersTable className="col-start-2 row-span-full" players={players} />
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
