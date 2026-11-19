import { useNavigate } from 'react-router'
import { Button } from '@/shared/ui'
import { GAMES_QUERY } from '@/entities/game'
import { clearSession } from '@/entities/session'
import { logoutUser } from '@/entities/user'

export function LogoutButton() {
  const navigate = useNavigate()

  const handleLogoutClick = async () => {
    try {
      await logoutUser()
    } finally {
      clearSession()
      GAMES_QUERY.invalidate()
      navigate('/')
    }
  }

  return (
    <Button data-testid="logout-button" onClick={handleLogoutClick}>
      Logout
    </Button>
  )
}
