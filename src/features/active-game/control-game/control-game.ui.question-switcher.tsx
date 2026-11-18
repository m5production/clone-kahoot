import { cn } from '@/shared/lib'
import { Button, buttonVariants } from '@/shared/ui'
import { useActiveGame } from '@/entities/active-game'

export function QuestionSwitcher() {
  const { allQuestions, activeQuestion, sendMessage } = useActiveGame()

  return (
    <ul data-testid="host-questions-list" className="w-full flex flex-col gap-2">
      {allQuestions.map(({ id }, index) => (
        <li key={id} data-testid={`host-question-item-${id}`} className="w-full">
          <Button
            data-testid="switch-question-button"
            aria-current={activeQuestion?.id === id}
            onClick={() =>
              sendMessage?.({
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
  )
}
