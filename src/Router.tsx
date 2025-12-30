import { Route, Routes, Navigate } from 'react-router'
import { Authorisation } from './pages/Authorisation'
import { MainWindow } from './pages/MainWindow'
import { AdminQuizReview } from './pages/AdminQuizReview'
import { Player } from './pages/Player'
import { ActiveQuezWithGameId } from './pages/AdminActiveQuiz'
import { Winners } from './pages/Winners'
import { ActiveGameProvider } from './components/ui/ActiveGameProvider'
import { AUTH_COOKIE_NAME } from './constants'
import { JSX, useEffect, useState } from 'react'

function RequireAuth({ children }: { children: JSX.Element }) {
  const [checked, setChecked] = useState(false)
  const [isValidUser, setIsValidUser] = useState(false)

  useEffect(() => {
    const cookie = typeof document !== 'undefined' ? document.cookie : ''
    const has = cookie.includes(`${AUTH_COOKIE_NAME}=`) || cookie.includes('authorisation=')
    setIsValidUser(has)
    setChecked(true)
  }, [])

  if (!checked) return null

  if (!isValidUser) {
    return <Navigate to="/" replace />
  }

  return children
}

export function Router() {
  return (
    <Routes>
      <Route
        index
        element={
          <Authorisation />
        }
      />
      <Route path="home" element={<RequireAuth><MainWindow /></RequireAuth>} />

      <Route path=":gameId/admin" element={<RequireAuth><AdminQuizReview /></RequireAuth>} />
      <Route
        path=":gameId/admin/activeGame"
        element={<RequireAuth><ActiveQuezWithGameId /></RequireAuth>}
      />
      <Route
        path=":gameId/player"
        element={
          <RequireAuth>
            <ActiveGameProvider>
              <Player />
            </ActiveGameProvider>
          </RequireAuth>
        }
      />
      <Route
        path=":gameId/player/winners"
        element={
          <RequireAuth>
            <ActiveGameProvider>
              <Winners />
            </ActiveGameProvider>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
