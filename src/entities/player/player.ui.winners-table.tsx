import type { PlayerScore } from './player.types'

type Props = React.ComponentProps<'ul'> & {
  winners: PlayerScore[]
}

export function WinnersTable({ winners, ...props }: Props) {
  return (
    <ul data-testid="winners-table" {...props}>
      {winners.map(({ name, score, id }, index) => (
        <li key={id} data-testid={`winner-row-${id}`}>
          <span>{index + 1}</span>. <span>{name}</span>: <span>{score}</span>
        </li>
      ))}
    </ul>
  )
}
