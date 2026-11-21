import { toast } from 'react-toastify'
import { Button } from '@/shared/ui'
import { useDeleteQuestionMutation } from './delete-question.mutation'

type Props = {
  questionId: string
  onDelete?: () => void
}

export function DeleteQuestionButton({ questionId, onDelete }: Props) {
  const { mutate: deleteQuestion } = useDeleteQuestionMutation(() => {
    toast.success('Question deleted successfully')
    onDelete?.()
  })

  const handleDeleteClick = () => {
    deleteQuestion(questionId)
  }

  return (
    <Button
      data-testid="delete-question-button"
      variant="outline"
      onClick={handleDeleteClick}
      className="w-fit text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      Delete question
    </Button>
  )
}
