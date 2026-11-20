import { Link, useNavigate, useSearchParams } from 'react-router'
import { getSafeReturnUrl } from '@/entities/session'
import { RegisterForm } from '@/features/session/register'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui'

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = getSafeReturnUrl(searchParams.get('next'))
  const suffix = next ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-b from-primary to-primary-deep p-4">
      <Card className="w-full max-w-sm rounded-3xl border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold tracking-tight text-primary">
            Clone-Kahoot!
          </CardTitle>
          <CardDescription>
            Choose a nickname and a password to create your account
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <RegisterForm onRegistered={() => navigate(next ?? '/home')} />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              data-testid="register-login-link"
              to={`/login${suffix}`}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              data-testid="register-welcome-link"
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
