import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import {
  ActiveGameProvider,
  SESSION_SUMMARY_QUERY,
} from '@/entities/active-game'
import { getApiErrorMessage } from '@/shared/api'
import { cn } from '@/shared/lib'
import { buttonVariants, Card, CardContent } from '@/shared/ui'
import { SessionView } from './session.ui.view'

/** `/join/:sessionId` — invitation link target for both the host and players */
export function SessionPage() {
  const { sessionId } = useParams()

  const summary = useQuery(SESSION_SUMMARY_QUERY.queryOptions(sessionId))

  if (!sessionId) return null

  if (summary.isPending) {
    return (
      <section className="min-h-full flex items-center justify-center">
        <p className="text-muted-foreground">Checking the session…</p>
      </section>
    )
  }

  if (summary.isError) {
    return (
      <section className="min-h-full flex flex-col items-center justify-center gap-6 p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p data-testid="session-unavailable">
              {getApiErrorMessage(summary.error)}
            </p>
          </CardContent>
        </Card>
        <Link
          data-testid="home-link"
          className={cn(buttonVariants({ variant: 'secondary' }))}
          to="/home"
        >
          Home
        </Link>
      </section>
    )
  }

  return (
    <ActiveGameProvider sessionId={sessionId}>
      <SessionView />
    </ActiveGameProvider>
  )
}
