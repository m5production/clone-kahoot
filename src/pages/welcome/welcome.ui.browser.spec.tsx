import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/shared/test'
import { WelcomePage } from './welcome.ui'

describe('WelcomePage', () => {
  it('describes the product and links to login and register (FR-84)', async () => {
    const screen = await renderWithProviders(<WelcomePage />)

    await expect.element(screen.getByText(/live quizzes/i)).toBeInTheDocument()

    const loginLink = screen.getByTestId('welcome-login-link')
    const registerLink = screen.getByTestId('welcome-register-link')
    await expect.element(loginLink).toHaveAttribute('href', '/login')
    await expect.element(registerLink).toHaveAttribute('href', '/register')
  })
})
