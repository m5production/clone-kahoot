import { Route, Routes } from 'react-router'
import { HomePage } from '@/pages/home'
import { HostGamePage } from '@/pages/host-game'
import { LoginPage } from '@/pages/login'
import { PlayerGamePage } from '@/pages/player-game'
import { QuizEditorPage } from '@/pages/quiz-editor'
import { RegisterPage } from '@/pages/register'
import { WelcomePage } from '@/pages/welcome'
import { WinnersPage } from '@/pages/winners'
import { GuestOnly } from './guest-only'
import { PlayerGameLayout } from './player-game-layout'
import { RequireAuth } from './require-auth'

export function AppRouter() {
  return (
    <Routes>
      <Route
        index
        element={
          <GuestOnly>
            <WelcomePage />
          </GuestOnly>
        }
      />
      <Route
        path="login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route
        path="home"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path=":gameId/admin"
        element={
          <RequireAuth>
            <QuizEditorPage />
          </RequireAuth>
        }
      />
      <Route
        path=":gameId/admin/activeGame"
        element={
          <RequireAuth>
            <HostGamePage />
          </RequireAuth>
        }
      />
      <Route
        path=":gameId/player"
        element={
          <RequireAuth>
            <PlayerGameLayout />
          </RequireAuth>
        }
      >
        <Route index element={<PlayerGamePage />} />
        <Route path="winners" element={<WinnersPage />} />
      </Route>
    </Routes>
  )
}
