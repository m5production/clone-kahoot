import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import { formatGameUpdatedAt } from '@/entities/game'
import { HISTORY_QUERY } from '@/entities/history'
import { cn } from '@/shared/lib'
import {
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui'

const STATUS_TEXT = {
  aborted: 'Aborted',
  finished: 'Finished',
} as const

/** FR-80: the host's own history, newest first; ?gameId= narrows it to one quiz (FR-83) */
export function HistoryPage() {
  const [searchParams] = useSearchParams()
  const gameId = searchParams.get('gameId') ?? undefined
  const { data: entries, isLoading } = useQuery(
    HISTORY_QUERY.queryOptions(gameId),
  )

  return (
    <div className="relative min-h-full w-full bg-gradient-to-b from-primary to-primary-deep p-6 flex flex-col items-center gap-8">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary-foreground drop-shadow-sm">
            Game history
          </h1>
          <Link
            data-testid="home-link"
            className={cn(buttonVariants({ variant: 'secondary' }))}
            to="/home"
          >
            Home
          </Link>
        </div>

        {gameId && (
          <Link
            data-testid="all-history-link"
            className="self-start text-primary-foreground underline underline-offset-4"
            to="/history"
          >
            Show history for all quizzes
          </Link>
        )}

        <Card className="rounded-3xl border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Past sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : entries && entries.length > 0 ? (
              <ul data-testid="history-list" className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <li key={entry.id} data-testid={`history-item-${entry.id}`}>
                    <Link
                      to={`/history/${entry.id}`}
                      className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {entry.quizTitle}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {formatGameUpdatedAt(entry.startedAt)} ·{' '}
                          {STATUS_TEXT[entry.status]} ·{' '}
                          {entry.playerCount === 1
                            ? '1 player'
                            : `${entry.playerCount} players`}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm">
                        {entry.winner
                          ? `Winner: ${entry.winner.name} (${entry.winner.score})`
                          : 'No winner'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p data-testid="history-empty" className="text-muted-foreground">
                No past sessions yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
