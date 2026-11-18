import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Card } from '@/shared/ui'
import { GAMES_QUERY } from '@/entities/game'
import { getSessionUserId } from '@/entities/session'
import { UserAvatar } from '@/entities/user'
import { CreateGameButton } from '@/features/game/create-game'
import { JoinGameForm } from '@/features/game/join-game'
import { LogoutButton } from '@/features/session/logout'

export function HomePage() {
  const { data: games } = useQuery(GAMES_QUERY.queryOptions())

  return (
    <div className="relative w-full h-full flex flex-col gap-4 items-center justify-center">
      <div className="fixed opacity-55 hover:opacity-100 transition top-4 right-4 flex flex-col gap-4">
        <UserAvatar userId={getSessionUserId()} className="static" />
        <LogoutButton />
      </div>

      <Card className="p-6">
        <JoinGameForm />

        <nav className="flex flex-col gap-6">
          <CreateGameButton />
        </nav>
      </Card>

      <Card className="p-4">
        {games && games.length !== 0 ? (
          <ul data-testid="games-list">
            {games.map(({ id }, index) => (
              <li key={id} data-testid={`game-item-${id}`}>
                <Link data-testid="game-link" to={`/${id}/admin`}>
                  Quiz #{index + 1}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p data-testid="games-empty">You haven't created any games yet.</p>
        )}
      </Card>
    </div>
  )
}
