import { rankPlayersByScore } from './player.lib'
import type { Player } from './player.types'

type Props = React.ComponentProps<'ul'> & {
  players: Player[]
}

export function WinnersTable({ players, ...props }: Props) {
  const winners = rankPlayersByScore(players)

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
