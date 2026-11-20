import type { Question } from '@/entities/question'
import { Button } from '@/shared/ui'
import { useCreateQuestionMutation } from './create-question.mutation'

type Props = {
  gameId: string
  onCreated?: (question: Question) => void
}

export function AddQuestionButton({ gameId, onCreated }: Props) {
  const { mutate: createQuestion } = useCreateQuestionMutation(onCreated)

  return (
    <Button
      data-testid="add-question-button"
      variant="outline"
      onClick={() => createQuestion({ gameId, text: '' })}
      className="w-full cursor-pointer border-dashed"
    >
      + Add new question
    </Button>
  )
}
