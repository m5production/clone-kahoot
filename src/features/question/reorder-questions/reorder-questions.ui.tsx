import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Question } from '@/entities/question'
import { Button } from '@/shared/ui'
import { moveQuestion } from './reorder-questions.lib'
import { useReorderQuestionsMutation } from './reorder-questions.mutation'

type Props = {
  gameId: string
  questions: Pick<Question, 'id'>[]
  index: number
}

export function MoveQuestionButtons({ gameId, questions, index }: Props) {
  const { mutate: reorder, isPending } = useReorderQuestionsMutation(gameId)

  const handleMove = (direction: -1 | 1) => (event: React.MouseEvent) => {
    // keep the click from selecting the question in the sidebar list item
    event.stopPropagation()
    const ids = moveQuestion(questions, index, direction)
    if (ids) reorder(ids)
  }

  return (
    <span className="flex shrink-0">
      <Button
        type="button"
        data-testid="move-up-button"
        variant="ghost"
        size="sm"
        aria-label="Move question up"
        className="h-6 w-6 px-0"
        disabled={index === 0 || isPending}
        onClick={handleMove(-1)}
      >
        <ChevronUp />
      </Button>
      <Button
        type="button"
        data-testid="move-down-button"
        variant="ghost"
        size="sm"
        aria-label="Move question down"
        className="h-6 w-6 px-0"
        disabled={index === questions.length - 1 || isPending}
        onClick={handleMove(1)}
      >
        <ChevronDown />
      </Button>
    </span>
  )
}
