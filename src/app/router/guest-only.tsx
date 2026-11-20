import { type JSX, useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { restoreSession } from '@/entities/session'

/**
 * Wraps guest pages (welcome, login, register): restores the stored session
 * and redirects a signed-in user to the home page (FR-87).
 */
export function GuestOnly({ children }: { children: JSX.Element }) {
  const [state, setState] = useState<'checking' | 'guest' | 'signed-in'>(
    'checking',
  )

  useEffect(() => {
    let cancelled = false
    restoreSession().then((user) => {
      if (!cancelled) setState(user ? 'signed-in' : 'guest')
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'checking') return null
  if (state === 'signed-in') return <Navigate to="/home" replace />

  return children
}
