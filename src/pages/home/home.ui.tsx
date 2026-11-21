import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { formatGameUpdatedAt, GAMES_QUERY } from '@/entities/game'
import { getSessionUserId } from '@/entities/session'
import { UserAvatar } from '@/entities/user'
import { CreateGameForm } from '@/features/game/create-game'
import { DeleteGameButton } from '@/features/game/delete-game'
import { JoinGameForm } from '@/features/game/join-game'
import { LogoutButton } from '@/features/session/logout'
import { cn } from '@/shared/lib'
import {
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui'

export function HomePage() {
  const { data: games } = useQuery(GAMES_QUERY.queryOptions())

  return (
    <div className="relative min-h-full w-full bg-gradient-to-b from-primary to-primary-deep p-6 flex flex-col items-center justify-center gap-8 text-center">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <Link
          data-testid="history-link"
          className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
          to="/history"
        >
          History
        </Link>
        <UserAvatar userId={getSessionUserId()} />
        <LogoutButton />
      </div>

      <div className="w-full max-w-md flex flex-col gap-8">
        <h1>
          <img
            src={`${import.meta.env.BASE_URL}piggies-quiz-logo.png`}
            alt="piggies quiz"
            className="mx-auto w-64 rounded-3xl bg-card p-6 shadow-2xl"
          />
        </h1>

        <Card className="rounded-3xl border-0 shadow-2xl">
          <CardContent className="flex flex-col gap-4">
            <JoinGameForm />
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <CreateGameForm />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>My quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            {games && games.length !== 0 ? (
              <ul data-testid="games-list" className="flex flex-col gap-2">
                {games.map(({ id, title, questionCount, updatedAt }) => (
                  <li
                    key={id}
                    data-testid={`game-item-${id}`}
                    className="flex items-center gap-2"
                  >
                    <Link
                      data-testid="game-link"
                      to={`/${id}/admin`}
                      className="block min-w-0 flex-1 rounded-xl border px-4 py-3 text-left transition hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="block truncate font-medium">
                        {title}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {questionCount === 1
                          ? '1 question'
                          : `${questionCount} questions`}
                        {' · edited '}
                        {formatGameUpdatedAt(updatedAt)}
                      </span>
                    </Link>
                    <Link
                      data-testid={`game-history-link-${id}`}
                      className="shrink-0 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      to={`/history?gameId=${id}`}
                    >
                      History
                    </Link>
                    <DeleteGameButton gameId={id} title={title} />
                  </li>
                ))}
              </ul>
            ) : (
              <p data-testid="games-empty" className="text-muted-foreground">
                You haven't created any games yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
