import { cn } from '@/shared/lib'
import type { PlayerScore } from './player.types'

type Props = React.ComponentProps<'ul'> & {
  winners: PlayerScore[]
}

const PLACE_STYLE: Record<number, string> = {
  1: 'bg-answer-yellow/30 text-foreground',
  2: 'bg-answer-blue/20 text-foreground',
  3: 'bg-answer-green/20 text-foreground',
}

/** BR-73: rows show the shared place, score and the number of correct answers; the top three are highlighted */
export function WinnersTable({ winners, className, ...props }: Props) {
  return (
    <ul
      data-testid="winners-table"
      className={cn('flex flex-col gap-2 p-6', className)}
      {...props}
    >
      {winners.map(({ place, name, score, correctCount, id }) => (
        <li
          key={id}
          data-testid={`winner-row-${id}`}
          className={cn(
            'flex items-center justify-between gap-4 rounded-xl px-4 py-3 font-semibold',
            PLACE_STYLE[place] ?? 'bg-muted text-muted-foreground',
          )}
        >
          <span>
            {place}. {name}
          </span>
          <span className="flex items-baseline gap-3">
            <span className="text-sm font-normal">{correctCount} correct</span>
            <span>{score}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
