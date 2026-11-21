import { Link } from 'react-router'
import { StartSessionFab } from '@/features/active-game/start-session'
import { RenameGameTitle } from '@/features/game/rename-game'
import { DeleteQuestionButton } from '@/features/question/delete-question'
import { EditQuestionForm } from '@/features/question/edit-question'
import { cn } from '@/shared/lib'
import { buttonVariants, Card, CardContent } from '@/shared/ui'
import type { EditorLayoutProps, EditorSection } from './quiz-editor.types'
import { EditorNavBar } from './quiz-editor.ui.mobile-nav'
import { QuestionsSidebar } from './quiz-editor.ui.questions-sidebar'

type Props = EditorLayoutProps & {
  section: EditorSection
  onSectionChange: (section: EditorSection) => void
  incompleteCount: number
}

/** FR-88: the one-section-at-a-time layout below 768px — content, the extended
    start FAB (D-11) and the bottom nav bar; the bottom padding keeps the end of
    the form out from under them */
export function QuizEditorMobile({
  gameId,
  isReady,
  selectedQuestion,
  onSelectQuestion,
  onDeleteSelected,
  section,
  onSectionChange,
  incompleteCount,
}: Props) {
  return (
    <section className="flex min-h-full flex-col">
      {/* FR-92: back link and the (truncated, still renamable) title in one row */}
      <header className="flex min-h-14 items-center gap-1 border-b bg-card px-2 py-1">
        <Link
          data-testid="home-link"
          to="/home"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            '-ml-1 shrink-0 text-muted-foreground',
          )}
        >
          ← Back to quizzes
        </Link>
        <div className="min-w-0 flex-1">
          <RenameGameTitle gameId={gameId} className="truncate text-base" />
        </div>
      </header>

      <div className="pb-[calc(9rem+env(safe-area-inset-bottom))]">
        {section === 'questions' ? (
          <QuestionsSidebar
            gameId={gameId}
            selectedQuestion={selectedQuestion}
            onSelectQuestion={onSelectQuestion}
            itemClassName="min-h-11"
            moveButtonClassName="h-11 w-11"
            className="flex flex-col gap-3 p-4"
          />
        ) : (
          <div className="p-4">
            <Card className="rounded-3xl">
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
                    Select a question on the Questions tab or add a new one
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* D-11: the FAB stays on screen on both tabs; the nav bar accounts for
          the home-indicator area on touch devices */}
      <StartSessionFab
        gameId={gameId}
        isReady={isReady}
        className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20"
      />
      <EditorNavBar
        section={section}
        onSectionChange={onSectionChange}
        selectedQuestion={selectedQuestion}
        incompleteCount={incompleteCount}
      />
    </section>
  )
}
