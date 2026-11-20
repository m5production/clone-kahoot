import { Link, useSearchParams } from 'react-router'
import { getSafeReturnUrl } from '@/entities/session'
import { Button } from '@/shared/ui'

export function WelcomePage() {
  const [searchParams] = useSearchParams()
  const next = getSafeReturnUrl(searchParams.get('next'))
  const suffix = next ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-b from-primary to-primary-deep p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary-foreground drop-shadow-sm">
            Clone-Kahoot!
          </h1>
          <p className="text-lg text-primary-foreground/90">
            Run live quizzes: create your own quiz, share a link with the
            players and watch them answer your questions in real time.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button
            asChild
            size="lg"
            className="w-full text-base font-bold bg-card text-card-foreground hover:bg-card/90"
          >
            <Link data-testid="welcome-login-link" to={`/login${suffix}`}>
              Sign in
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full text-base font-bold"
          >
            <Link data-testid="welcome-register-link" to={`/register${suffix}`}>
              Create account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
