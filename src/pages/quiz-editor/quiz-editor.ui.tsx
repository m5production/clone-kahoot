import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { DeleteQuestionButton } from '@/features/question/delete-question'
import { EditQuestionForm } from '@/features/question/edit-question'
import { cn } from '@/shared/lib'
import { Button, buttonVariants } from '@/shared/ui'
import type { SelectedQuestion } from './quiz-editor.types'
import { QuestionsSidebar } from './quiz-editor.ui.questions-sidebar'

export function QuizEditorPage() {
  const { gameId } = useParams()
  const [selectedQuestion, setSelectedQuestion] = useState<SelectedQuestion>()

  if (!gameId) {
    return null
  }

  const isReadyToStartGame = true // TODO: disable start game btn when not all questions ready

  return (
    <section className="grid grid-cols-[200px_1fr] h-full">
      <QuestionsSidebar
        gameId={gameId}
        selectedQuestion={selectedQuestion}
        onSelectQuestion={setSelectedQuestion}
        className="bg-blue-500 text-white p-4 h-full"
      >
        <Link
          data-testid="home-link"
          to="/home"
          className={cn(buttonVariants(), 'mb-4')}
        >
          Go to main page
        </Link>
      </QuestionsSidebar>
      <div className="p-4 flex flex-col">
        {isReadyToStartGame ? (
          <Link
            data-testid="start-game-link"
            to={`/${gameId}/admin/activeGame`}
            className={cn(buttonVariants(), 'self-end')}
          >
            Start this quiz
          </Link>
        ) : (
          <Button
            title="You need to fill question text and provide accepted answers to all the questions"
            disabled
            className="self-end"
          >
            Start this quiz
          </Button>
        )}
        {selectedQuestion && (
          <div>
            <EditQuestionForm
              questionId={selectedQuestion.id}
              questionNumber={selectedQuestion.number}
              className="flex flex-col gap-10"
            />
            <DeleteQuestionButton
              questionId={selectedQuestion.id}
              onDelete={() => setSelectedQuestion(undefined)}
            />
          </div>
        )}
      </div>
    </section>
  )
}
