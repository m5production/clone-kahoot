import {
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
  PropsWithChildren,
  SetStateAction,
} from 'react'
import { usePostNewQuestion } from './api/usePostNewQuestion'
import { Button } from '@/components/ui/button'
import { useGetAllQuestions } from '@/lib/useGetAllQuestions'
import { cn } from '@/lib/utils'
import { useQuestionContext } from './Question.model'

type Props = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> &
  PropsWithChildren & {
    gameId: string
  }

export function QuestionsList({
  gameId,
  children,
  ...props
}: Props) {
  const { setSelectedQuestion, selectedQuestion } = useQuestionContext();
  const { data: questions } = useGetAllQuestions(gameId)

  const { mutate: addNewQuestion } = usePostNewQuestion((id: string) => {
    setSelectedQuestion({ id, number: (questions?.length || 0) + 1 })
  })

  return (
    <aside {...props}>
      {children}
      <Button
        onClick={() =>
          addNewQuestion({
            gameId,
            text: '',
          })
        }
        className="w-full cursor-pointer"
      >
        + Add new question
      </Button>

      <h3 className="font-bold text-xl mt-4">Questions</h3>

      <ul className="w-full">
        {questions &&
          questions.map(({ id }, index) => (
            <li
              key={id}
              onClick={() => setSelectedQuestion({ id, number: index + 1 })}
              className={cn(
                'w-full truncate hover:cursor-pointer p-1 hover:ring-1 ring-amber-300 rounded-md transition',
                selectedQuestion && selectedQuestion.id === id && 'bg-amber-200'
              )}
            >
              Question {index + 1}
            </li>
          ))}
      </ul>
    </aside>
  )
}
