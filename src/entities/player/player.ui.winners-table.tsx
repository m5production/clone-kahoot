import { cn } from '@/shared/lib'
import type { PlayerScore } from './player.types'

type Props = React.ComponentProps<'ul'> & {
  winners: PlayerScore[]
}

/** BR-73: rows show the shared place, score and the number of correct answers; the top three are highlighted */
export function WinnersTable({ winners, className, ...props }: Props) {
  return (
    <ul
      data-testid="winners-table"
      className={cn('flex flex-col gap-2 p-6', className)}
      {...props}
    >
      {winners.map((winner) => (
        <WinnerRow key={winner.id} {...winner} />
      ))}
    </ul>
  )
}

function WinnerRow({ place, name, score, correctCount, id }: PlayerScore) {
  return (
    <li
      data-testid={`winner-row-${id}`}
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl px-4 py-3 font-semibold',
        place === 1 && 'bg-answer-yellow/30 text-foreground',
        place === 2 && 'bg-answer-blue/20 text-foreground',
        place === 3 && 'bg-answer-green/20 text-foreground',
        place > 3 && 'bg-muted text-muted-foreground',
      )}
    >
      <span className="min-w-0 truncate">
        {place}. {name}
      </span>
      <span className="flex shrink-0 items-baseline gap-3">
        <span className="text-sm font-normal">{correctCount} correct</span>
        <span>{score}</span>
      </span>
    </li>
  )
}
