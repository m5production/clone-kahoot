import { describe, expect, it, vi } from 'vitest'
import { restoreSession } from '@/entities/session'
import { renderWithProviders } from '@/shared/test'
import { RequireAuth } from './require-auth'

vi.mock('@/entities/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/session')>()),
  restoreSession: vi.fn(),
}))

// The guard must be mounted at its real route only: the wildcard route would
// match the redirect target too and bounce the navigation forever
const renderGuard = (route: string) =>
  renderWithProviders(
    <RequireAuth>
      <p data-testid="protected-content">protected content</p>
    </RequireAuth>,
    { route, path: route },
  )

describe('RequireAuth', () => {
  it('renders the page for a signed-in user', async () => {
    vi.mocked(restoreSession).mockResolvedValue({ id: 'u1', name: 'alice' })
    const screen = await renderGuard('/home')

    await expect.element(screen.getByTestId('protected-content')).toBeVisible()
  })

  it('sends a guest to the welcome page with a return url (FR-72)', async () => {
    vi.mocked(restoreSession).mockResolvedValue(null)
    const screen = await renderGuard('/abc/admin')

    await expect
      .element(screen.getByTestId('test-location'))
      .toHaveTextContent('/')
  })
})
