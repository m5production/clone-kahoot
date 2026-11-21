import { cn } from '@/shared/lib'
import { optionColorClass } from './answer-option.lib'
import type { OptionMark } from './answer-option.types'

type Props = Omit<React.ComponentProps<'ul'>, 'children'> & {
  /** options in display order (D-13); `correct`/`selected` marks are applied after the reveal */
  options: OptionMark[]
}

/** FR-102: the option list the host and the player see — before the reveal it is
    plain colored rows, after it the correct option stands out and the rest dim */
export function AnswerOptionsList({ options, className, ...props }: Props) {
  const anyCorrect = options.some((option) => option.correct)

  return (
    <ul
      data-testid="answer-options"
      className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}
      {...props}
    >
      {options.map((option, index) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: the order is the identity — options come in display order (D-13)
          key={index}
          className={cn(
            'rounded-xl px-4 py-3 text-center font-bold text-white',
            optionColorClass(index),
            anyCorrect && !option.correct && 'opacity-40',
            option.correct && 'ring-4 ring-white/80',
            option.selected && 'ring-4 ring-offset-2 ring-offset-transparent',
          )}
        >
          {option.correct && '✓ '}
          {option.text}
          {option.selected && (
            <span className="block text-xs font-medium uppercase tracking-wide">
              your pick
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
