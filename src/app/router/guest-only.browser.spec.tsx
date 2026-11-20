import { describe, expect, it, vi } from 'vitest'
import { restoreSession, saveSessionToken } from '@/entities/session'
import { renderWithProviders } from '@/shared/test'
import { GuestOnly } from './guest-only'

vi.mock('@/entities/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/session')>()),
  restoreSession: vi.fn(),
}))

const renderGuard = () =>
  renderWithProviders(
    <GuestOnly>
      <p data-testid="guest-content">guest content</p>
    </GuestOnly>,
  )

describe('GuestOnly', () => {
  it('renders the page for a visitor without a session', async () => {
    vi.mocked(restoreSession).mockResolvedValue(null)
    const screen = await renderGuard()

    await expect.element(screen.getByTestId('guest-content')).toBeVisible()
  })

  it('redirects a signed-in user to the home page (FR-87)', async () => {
    saveSessionToken('t1')
    vi.mocked(restoreSession).mockResolvedValue({ id: 'u1', name: 'alice' })
    const screen = await renderGuard()

    await expect
      .element(screen.getByTestId('test-location'))
      .toHaveTextContent('/home')
  })
})
