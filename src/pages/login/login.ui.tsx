import { Link, useNavigate } from 'react-router'
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

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-b from-primary to-primary-deep p-4">
      <Card className="w-full max-w-sm rounded-3xl border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold tracking-tight text-primary">
            Clone-Kahoot!
          </CardTitle>
          <CardDescription>
            Please, enter your nickname and password
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <LoginForm onLoggedIn={() => navigate('/home')} />
          <p className="text-center text-sm text-muted-foreground">
            No account yet?{' '}
            <Link
              data-testid="login-register-link"
              to="/register"
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
