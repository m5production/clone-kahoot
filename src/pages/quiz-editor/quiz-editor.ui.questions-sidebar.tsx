import { useQuery } from '@tanstack/react-query'
import { TriangleAlert } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { GAME_QUESTIONS_QUERY, isQuestionReady } from '@/entities/question'
import { AddQuestionButton } from '@/features/question/create-question'
import { MoveQuestionButtons } from '@/features/question/reorder-questions'
import { cn } from '@/shared/lib'
import type { SelectedQuestion } from './quiz-editor.types'

type Props = React.ComponentProps<'aside'> &
  PropsWithChildren<{
    gameId: string
    selectedQuestion: SelectedQuestion | undefined
    onSelectQuestion: (question: SelectedQuestion) => void
    /** extra classes for each list row, e.g. a taller touch target (NFR-U7) */
    itemClassName?: string
    /** extra classes for the move up/down buttons (NFR-U7) */
    moveButtonClassName?: string
  }>

export function QuestionsSidebar({
  gameId,
  selectedQuestion,
  onSelectQuestion,
  itemClassName,
  moveButtonClassName,
  children,
  ...props
}: Props) {
  const { data: questions } = useQuery(
    GAME_QUESTIONS_QUERY.queryOptions(gameId),
  )

  return (
    <aside data-testid="questions-sidebar" {...props}>
      {children}
      <h3 className="font-bold text-lg">Questions</h3>

      <ul
        data-testid="questions-list"
        className="w-full flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto"
      >
        {questions?.map((question, index) => (
          // biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-selected is the documented e2e selection marker (test-ids.md); the inner button carries the interaction
          <li
            key={question.id}
            data-testid={`question-item-${question.id}`}
            aria-selected={selectedQuestion?.id === question.id}
            className={cn(
              'w-full rounded-lg text-sm font-medium transition hover:bg-accent hover:text-accent-foreground flex items-center gap-1',
              selectedQuestion?.id === question.id &&
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              itemClassName,
            )}
          >
            <button
              type="button"
              className="min-w-0 flex-1 cursor-pointer self-stretch truncate px-3 py-2 text-left"
              onClick={() =>
                onSelectQuestion({ id: question.id, number: index + 1 })
              }
            >
              Question {index + 1}
            </button>
            {!isQuestionReady(question) && (
              <TriangleAlert
                aria-label="incomplete"
                role="img"
                className="size-4 shrink-0 text-amber-500"
              />
            )}
            <MoveQuestionButtons
              gameId={gameId}
              questions={questions}
              index={index}
              buttonClassName={moveButtonClassName}
            />
          </li>
        ))}
      </ul>

      <AddQuestionButton
        gameId={gameId}
        onCreated={({ id }) =>
          onSelectQuestion({ id, number: (questions?.length || 0) + 1 })
        }
      />
    </aside>
  )
}
