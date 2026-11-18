import { Outlet, useNavigate, useParams } from 'react-router'
import { ActiveGameProvider } from '@/entities/active-game'
import { getSessionUserId } from '@/entities/session'

/** Keeps one game connection for the player game and its winners screen */
export function PlayerGameLayout() {
  const navigate = useNavigate()
  const { gameId } = useParams()

  if (!gameId) {
    return null
  }

  return (
    <ActiveGameProvider
      role="player"
      gameId={gameId}
      userId={getSessionUserId()}
      onWinnersShown={() => navigate('winners', { relative: 'path' })}
    >
      <Outlet />
    </ActiveGameProvider>
  )
}
