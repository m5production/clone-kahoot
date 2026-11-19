import { useQuery } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { GAME_QUESTIONS_QUERY } from '@/entities/question'
import { AddQuestionButton } from '@/features/question/create-question'
import { cn } from '@/shared/lib'
import type { SelectedQuestion } from './quiz-editor.types'

type Props = React.ComponentProps<'aside'> &
  PropsWithChildren<{
    gameId: string
    selectedQuestion: SelectedQuestion | undefined
    onSelectQuestion: (question: SelectedQuestion) => void
  }>

export function QuestionsSidebar({
  gameId,
  selectedQuestion,
  onSelectQuestion,
  children,
  ...props
}: Props) {
  const { data: questions } = useQuery(
    GAME_QUESTIONS_QUERY.queryOptions(gameId),
  )

  return (
    <aside data-testid="questions-sidebar" {...props}>
      {children}
      <AddQuestionButton
        gameId={gameId}
        onCreated={({ id }) =>
          onSelectQuestion({ id, number: (questions?.length || 0) + 1 })
        }
      />

      <h3 className="font-bold text-xl mt-4">Questions</h3>

      <ul data-testid="questions-list" className="w-full">
        {questions?.map(({ id }, index) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/useAriaPropsSupportedByRole: a plain list item, selection is visual-only
          <li
            key={id}
            data-testid={`question-item-${id}`}
            aria-selected={selectedQuestion?.id === id}
            onClick={() => onSelectQuestion({ id, number: index + 1 })}
            className={cn(
              'w-full truncate hover:cursor-pointer p-1 hover:ring-1 ring-amber-300 rounded-md transition',
              selectedQuestion?.id === id && 'bg-amber-200',
            )}
          >
            Question {index + 1}
          </li>
        ))}
      </ul>
    </aside>
  )
}
