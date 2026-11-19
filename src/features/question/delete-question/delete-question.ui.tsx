import { toast } from 'react-toastify'
import { Button } from '@/shared/ui'
import { useDeleteQuestionMutation } from './delete-question.mutation'

type Props = {
  questionId: string
  onDelete?: () => void
}

export function DeleteQuestionButton({ questionId, onDelete }: Props) {
  const { mutate: deleteQuestion } = useDeleteQuestionMutation(() =>
    toast.success('Question deleted successfully'),
  )

  const handleDeleteClick = () => {
    deleteQuestion(questionId)
    onDelete?.()
  }

  return (
    <Button
      data-testid="delete-question-button"
      onClick={handleDeleteClick}
      className="mt-4"
    >
      Delete question
    </Button>
  )
}
