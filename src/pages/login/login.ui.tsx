import { Link, useNavigate, useSearchParams } from 'react-router'
import { getSafeReturnUrl } from '@/entities/session'
import { LoginForm } from '@/features/session/login'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = getSafeReturnUrl(searchParams.get('next'))
  const suffix = next ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-b from-primary to-primary-deep p-4">
      <Card className="w-full max-w-sm rounded-3xl border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle>
            <img
              src={`${import.meta.env.BASE_URL}piggies-quiz-logo.png`}
              alt="piggies quiz"
              className="mx-auto w-48"
            />
          </CardTitle>
          <CardDescription>
            Please, enter your nickname and password
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <LoginForm onLoggedIn={() => navigate(next ?? '/home')} />
          <p className="text-center text-sm text-muted-foreground">
            No account yet?{' '}
            <Link
              data-testid="login-register-link"
              to={`/register${suffix}`}
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              data-testid="login-welcome-link"
              to="/"
              className="hover:underline"
            >
              Back to welcome
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
