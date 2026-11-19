import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { ToastContainer } from 'react-toastify'
import { queryClient } from '@/shared/api'
import { AppRouter } from './router/app-router'
import './styles/index.css'
import './styles/app.css'

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <ToastContainer />
      </QueryClientProvider>
    </BrowserRouter>
  )
}
