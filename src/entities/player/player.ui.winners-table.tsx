import { cn } from '@/shared/lib'
import type { PlayerScore } from './player.types'

type Props = React.ComponentProps<'ul'> & {
  winners: PlayerScore[]
}

export function WinnersTable({ winners, className, ...props }: Props) {
  return (
    <ul
      data-testid="winners-table"
      className={cn('flex flex-col gap-2 p-6', className)}
      {...props}
    >
      {winners.map(({ name, score, id }, index) => (
        <li
          key={id}
          data-testid={`winner-row-${id}`}
          className={cn(
            'flex items-center justify-between rounded-xl px-4 py-3 font-semibold',
            index === 0
              ? 'bg-answer-yellow/25 text-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <span>
            {index + 1}. {name}:{' '}
          </span>
          <span>{score}</span>
        </li>
      ))}
    </ul>
  )
}
