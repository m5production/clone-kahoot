import { useNavigate } from 'react-router'
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
