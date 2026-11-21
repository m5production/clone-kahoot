import { cn } from '@/shared/lib'
import type { Player, PlayerAnswer } from './player.types'

type Props = React.ComponentProps<'section'> & {
  players: Player[]
  showAnswered?: boolean
  playerAnswers: PlayerAnswer[] | null
}

export function Players({
  players,
  showAnswered,
  playerAnswers,
  ...props
}: Props) {
  return (
    <section data-testid="players-panel" {...props}>
      {playerAnswers ? (
        <ul data-testid="player-answers-list" className="flex flex-wrap gap-2">
          {playerAnswers.map(
            ({ playerId, playerName, text, isCorrect, points }) => (
              <li
                key={playerId}
                data-testid={`player-answer-item-${playerId}`}
                className={cn(
                  'rounded-full px-2 border-2 border-current bg-destructive/15 text-destructive',
                  isCorrect && 'bg-success/15 text-success',
                )}
              >
                <span className="font-semibold">{playerName}:</span>{' '}
                {text || 'No answer'}{' '}
                <span className="text-xs font-semibold">+{points}</span>
              </li>
            ),
          )}
        </ul>
      ) : (
        <>
          <h3 className="text-xl font-bold">Players ({players.length})</h3>
          <ul
            data-testid="players-list"
            className="flex flex-wrap gap-4 items-start"
          >
            {players.map((player) => (
              <li
                key={player.id}
                data-testid={`player-item-${player.id}`}
                className={cn(
                  'rounded-xl p-2 text-white',
                  !player.connected && 'opacity-50',
                  showAnswered && player.answered && 'ring-primary ring-4',
                )}
                style={{ backgroundColor: player.bgColor }}
              >
                {player.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
