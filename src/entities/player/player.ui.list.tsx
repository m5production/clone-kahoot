import { cn } from '@/shared/lib'
import { hasAnsweredQuestion } from './player.lib'
import type { Player, PlayerAnswer } from './player.types'

type Props = React.ComponentProps<'section'> & {
  players: Player[]
  activeQuestionId?: string
  playerAnswers: PlayerAnswer[] | null
}

export function Players({
  players,
  activeQuestionId,
  playerAnswers,
  ...props
}: Props) {
  return (
    <section data-testid="players-panel" {...props}>
      {playerAnswers && activeQuestionId ? (
        <ul data-testid="player-answers-list" className="flex flex-wrap">
          {playerAnswers.map(({ playerAnswer, playerId, playerName }) => (
            <li
              key={playerId}
              data-testid={`player-answer-item-${playerId}`}
              className={cn(
                'rounded-full px-2 border-2 border-current bg-destructive/15 text-destructive',
                playerAnswer?.isCorrect && 'bg-success/15 text-success',
              )}
            >
              <span className="font-semibold">{playerName}:</span>{' '}
              {playerAnswer?.text || 'No answer'}
            </li>
          ))}
        </ul>
      ) : (
        <>
          <h3 className="text-xl font-bold">Players ({players.length})</h3>
          <ul data-testid="players-list" className="flex gap-4 items-start">
            {players.map((player) => (
              <li
                key={player.id}
                data-testid={`player-item-${player.id}`}
                className={cn(
                  'rounded-xl p-2 text-white',
                  activeQuestionId &&
                    hasAnsweredQuestion(player, activeQuestionId) &&
                    'ring-primary ring-4',
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
