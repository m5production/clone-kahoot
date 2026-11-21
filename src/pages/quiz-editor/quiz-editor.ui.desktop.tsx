import { Link } from 'react-router'
import {
  QUIZ_NOT_READY_REASON,
  StartSessionButton,
} from '@/features/active-game/start-session'
import { RenameGameTitle } from '@/features/game/rename-game'
import { DeleteQuestionButton } from '@/features/question/delete-question'
import { EditQuestionForm } from '@/features/question/edit-question'
import { cn } from '@/shared/lib'
import { Button, buttonVariants, Card, CardContent } from '@/shared/ui'
import type { EditorLayoutProps } from './quiz-editor.types'
import { QuestionsSidebar } from './quiz-editor.ui.questions-sidebar'

/** FR-88: the desktop two-column layout, kept unchanged at ≥768px */
export function QuizEditorDesktop({
  gameId,
  isReady,
  selectedQuestion,
  onSelectQuestion,
  onDeleteSelected,
}: EditorLayoutProps) {
  return (
    <section className="grid grid-cols-[280px_1fr] min-h-full">
      <QuestionsSidebar
        gameId={gameId}
        selectedQuestion={selectedQuestion}
        onSelectQuestion={onSelectQuestion}
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
          {isReady ? (
            <StartSessionButton gameId={gameId} />
          ) : (
            <Button
              data-testid="start-game-button"
              title={QUIZ_NOT_READY_REASON}
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
                  onDelete={onDeleteSelected}
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
