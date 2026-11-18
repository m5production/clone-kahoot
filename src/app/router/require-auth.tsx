import { JSX, useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { isAuthenticated } from '@/entities/session'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const [checked, setChecked] = useState(false)
  const [isValidUser, setIsValidUser] = useState(false)

  useEffect(() => {
    setIsValidUser(isAuthenticated())
    setChecked(true)
  }, [])

  if (!checked) return null

  if (!isValidUser) {
    return <Navigate to="/" replace />
  }

  return children
}
