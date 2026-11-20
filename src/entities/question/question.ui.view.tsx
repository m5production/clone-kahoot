import { ImgWithPlaceholder } from '@/shared/ui'
import type { Question } from './question.types'

export function QuestionView({ text, img }: Pick<Question, 'img' | 'text'>) {
  return (
    <div data-testid="question-view" className="contents">
      {img && (
        <ImgWithPlaceholder
          className="flex flex-col items-center gap-4 rounded-lg mx-auto"
          src={img}
          alt={`Image illustrating the question: ${text}`}
        />
      )}
      <p className="font-extrabold text-4xl text-center text-balance">{text}</p>
    </div>
  )
}
