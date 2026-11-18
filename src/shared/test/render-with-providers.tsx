import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { render } from 'vitest-browser-react'
import { queryClient } from '@/shared/api'

function LocationProbe() {
  const { pathname } = useLocation()

  return <output data-testid="test-location">{pathname}</output>
}

interface Options {
  /** Initial URL */
  route?: string
  /** Route pattern the UI is mounted at, to provide route params */
  path?: string
}

/** Renders UI inside the app providers; the current path is shown in `test-location` */
export const renderWithProviders = (
  ui: ReactNode,
  { route = '/', path = '*' }: Options = {}
) =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          {path !== '*' && <Route path="*" element={null} />}
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
