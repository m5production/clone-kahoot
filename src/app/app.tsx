import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { ToastContainer } from 'react-toastify'
import { queryClient } from '@/shared/api'
import { ErrorBoundary } from './error-boundary'
import { AppRouter } from './router/app-router'
import './styles/index.css'
import './styles/app.css'

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
        <ToastContainer />
      </QueryClientProvider>
    </BrowserRouter>
  )
}
