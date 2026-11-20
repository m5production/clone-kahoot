import { Link, useNavigate } from 'react-router'
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
          <RegisterForm onRegistered={() => navigate('/home')} />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              data-testid="register-login-link"
              to="/login"
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
