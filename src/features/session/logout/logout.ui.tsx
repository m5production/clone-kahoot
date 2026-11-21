import { useNavigate } from 'react-router'
import { clearSession } from '@/entities/session'
import { logoutUser } from '@/entities/user'
import { queryClient } from '@/shared/api'
import { Button } from '@/shared/ui'

export function LogoutButton() {
  const navigate = useNavigate()

  const handleLogoutClick = async () => {
    try {
      await logoutUser()
    } finally {
      clearSession()
      // another user may sign in next on this machine — drop all cached data
      queryClient.clear()
      navigate('/')
    }
  }

  return (
    <Button
      data-testid="logout-button"
      variant="ghost"
      className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
      onClick={handleLogoutClick}
    >
      Logout
    </Button>
  )
}
