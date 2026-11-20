import { type JSX, useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { getSafeReturnUrl, restoreSession } from '@/entities/session'

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

  const [searchParams] = useSearchParams()
  const next = getSafeReturnUrl(searchParams.get('next'))

  if (state === 'checking') return null
  // FR-72: a signed-in user continues to the page they came for
  if (state === 'signed-in') return <Navigate to={next ?? '/home'} replace />

  return children
}
