import { type JSX, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { isAuthenticated } from '@/entities/session'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const [checked, setChecked] = useState(false)
  const [isValidUser, setIsValidUser] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsValidUser(isAuthenticated())
    setChecked(true)
  }, [])

  if (!checked) return null

  if (!isValidUser) {
    // FR-72: the guest signs in and comes back to this page (invitation links)
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/?next=${next}`} replace />
  }

  return children
}
