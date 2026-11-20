import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { GAME_QUESTIONS_QUERY, isQuizReady } from '@/entities/question'
import { StartSessionButton } from '@/features/active-game/start-session'
import { RenameGameTitle } from '@/features/game/rename-game'
import { DeleteQuestionButton } from '@/features/question/delete-question'
import { EditQuestionForm } from '@/features/question/edit-question'
import { cn } from '@/shared/lib'
import { Button, buttonVariants, Card, CardContent } from '@/shared/ui'
import type { SelectedQuestion } from './quiz-editor.types'
import { QuestionsSidebar } from './quiz-editor.ui.questions-sidebar'

export function QuizEditorPage() {
  const { gameId } = useParams()
  const [selectedQuestion, setSelectedQuestion] = useState<SelectedQuestion>()
  const { data: questions } = useQuery(
    GAME_QUESTIONS_QUERY.queryOptions(gameId),
  )

  if (!gameId) {
    return null
  }

  // FR-55, BR-49: the quiz launches only when every question is game-ready
  const isReadyToStartGame = questions ? isQuizReady(questions) : false

  return (
    <section className="grid grid-cols-[280px_1fr] min-h-full">
      <QuestionsSidebar
        gameId={gameId}
        selectedQuestion={selectedQuestion}
        onSelectQuestion={setSelectedQuestion}
        className="bg-card border-r p-4 flex flex-col gap-3 h-screen sticky top-0"
      >
        <Link
          data-testid="home-link"
          to="/home"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'self-start -ml-2 text-muted-foreground',
          )}
        >
          ← Back to quizzes
        </Link>
      </QuestionsSidebar>

      <div className="flex flex-col gap-6 p-6 min-w-0">
        <header className="flex items-center justify-between gap-4">
          <RenameGameTitle gameId={gameId} />
          {isReadyToStartGame ? (
            <StartSessionButton gameId={gameId} />
          ) : (
            <Button
              data-testid="start-game-button"
              title="You need to fill question text and provide accepted answers to all the questions"
              disabled
              size="lg"
            >
              Start this quiz
            </Button>
          )}
        </header>

        <Card className="rounded-3xl max-w-2xl">
          <CardContent className="flex flex-col gap-6">
            {selectedQuestion ? (
              <>
                <EditQuestionForm
                  questionId={selectedQuestion.id}
                  questionNumber={selectedQuestion.number}
                  className="flex flex-col gap-6"
                />
                <DeleteQuestionButton
                  questionId={selectedQuestion.id}
                  onDelete={() => setSelectedQuestion(undefined)}
                />
              </>
            ) : (
              <p className="py-12 text-center text-muted-foreground">
                Select a question on the left or add a new one
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
