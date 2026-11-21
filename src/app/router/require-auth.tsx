import { type JSX, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { restoreSession } from '@/entities/session'

/**
 * Wraps protected pages: restores the stored session (validating the token
 * against the API, an expired one is dropped) and sends a guest to the
 * welcome page with a return url (FR-72).
 */
export function RequireAuth({ children }: { children: JSX.Element }) {
  const [state, setState] = useState<'checking' | 'authed' | 'guest'>(
    'checking',
  )
  const location = useLocation()

  useEffect(() => {
    let cancelled = false
    restoreSession().then((user) => {
      if (!cancelled) setState(user ? 'authed' : 'guest')
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'checking') return null

  if (state === 'guest') {
    // FR-72: the guest signs in and comes back to this page (invitation links)
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/?next=${next}`} replace />
  }

  return children
}
