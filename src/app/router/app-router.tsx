import { Navigate, Route, Routes } from 'react-router'
import { HistoryPage } from '@/pages/history'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { QuizEditorPage } from '@/pages/quiz-editor'
import { RegisterPage } from '@/pages/register'
import { SessionPage } from '@/pages/session'
import { SessionReportPage } from '@/pages/session-report'
import { WelcomePage } from '@/pages/welcome'
import { GuestOnly } from './guest-only'
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
        path="join/:sessionId"
        element={
          <RequireAuth>
            <SessionPage />
          </RequireAuth>
        }
      />
      <Route
        path="history"
        element={
          <RequireAuth>
            <HistoryPage />
          </RequireAuth>
        }
      />
      <Route
        path="history/:sessionId"
        element={
          <RequireAuth>
            <SessionReportPage />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
