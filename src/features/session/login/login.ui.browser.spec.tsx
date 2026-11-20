import { toast } from 'react-toastify'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { getSessionToken, getSessionUserId } from '@/entities/session'
import { loginUser } from './login.service'
import { LoginForm } from './login.ui'

vi.mock('react-toastify', () => ({ toast: vi.fn() }))
vi.mock('./login.service', () => ({
  loginUser: vi.fn(),
}))

const renderForm = async () => {
  const onLoggedIn = vi.fn()
  const screen = await render(<LoginForm onLoggedIn={onLoggedIn} />)

  return { screen, onLoggedIn }
}

describe('LoginForm', () => {
  it('logs in and reports success', async () => {
    vi.mocked(loginUser).mockResolvedValue({
      id: 'u1',
      name: 'alice',
      token: 't1',
    })
    const { screen, onLoggedIn } = await renderForm()

    await screen.getByTestId('login-name-input').fill('alice')
    await screen.getByTestId('login-password-input').fill('secret-password')
    await screen.getByTestId('login-submit-button').click()

    await expect.poll(() => onLoggedIn.mock.calls.length).toBe(1)
    expect(loginUser).toHaveBeenCalledWith({
      name: 'alice',
      password: 'secret-password',
    })
  })

  it('does not submit without a nickname and a password', async () => {
    const { screen, onLoggedIn } = await renderForm()

    await screen.getByTestId('login-name-input').fill('alice')
    await screen.getByTestId('login-submit-button').click()

    // react-hook-form focuses the first invalid field once validation has failed
    await expect
      .element(screen.getByTestId('login-password-input'))
      .toHaveFocus()
    expect(loginUser).not.toHaveBeenCalled()
    expect(onLoggedIn).not.toHaveBeenCalled()
  })

  it('shows the server error and stays on the page', async () => {
    vi.mocked(loginUser).mockRejectedValue(
      new Error('Invalid name or password'),
    )
    const { screen, onLoggedIn } = await renderForm()

    await screen.getByTestId('login-name-input').fill('alice')
    await screen.getByTestId('login-password-input').fill('wrong-password')
    await screen.getByTestId('login-submit-button').click()

    await expect.poll(() => vi.mocked(toast).mock.calls.length).toBe(1)
    expect(onLoggedIn).not.toHaveBeenCalled()
    expect(getSessionToken()).toBeNull()
    expect(getSessionUserId()).toBeNull()
  })
})
