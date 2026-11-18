import { useNavigate } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui'
import { LoginForm } from '@/features/session/login'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="h-full flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Authorisation</CardTitle>
          <CardDescription>
            Please, enter your nickname and password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <LoginForm onLoggedIn={() => navigate('/home')} />
        </CardContent>
      </Card>
    </div>
  )
}
