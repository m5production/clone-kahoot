import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { getSessionUserId, saveSessionUserId } from '@/entities/session'
import { isExistingUser, loginOrRegister } from './login.service'
import { LoginForm } from './login.ui'

vi.mock('./login.service', () => ({
  loginOrRegister: vi.fn(),
  isExistingUser: vi.fn(),
}))

const renderForm = async () => {
  const onLoggedIn = vi.fn()
  const screen = await render(<LoginForm onLoggedIn={onLoggedIn} />)

  return { screen, onLoggedIn }
}

describe('LoginForm', () => {
  it('logs in, remembers the user and reports success', async () => {
    vi.mocked(loginOrRegister).mockResolvedValue({ id: 'u1', name: 'alice' })
    const { screen, onLoggedIn } = await renderForm()

    await screen.getByTestId('login-name-input').fill('alice')
    await screen.getByTestId('login-password-input').fill('secret')
    await screen.getByTestId('login-submit-button').click()

    await expect.poll(() => onLoggedIn.mock.calls.length).toBe(1)
    expect(loginOrRegister).toHaveBeenCalledWith({ name: 'alice', password: 'secret' })
    expect(getSessionUserId()).toBe('u1')
  })

  it('does not submit without a nickname and a password', async () => {
    const { screen, onLoggedIn } = await renderForm()

    await screen.getByTestId('login-name-input').fill('alice')
    await screen.getByTestId('login-submit-button').click()

    // react-hook-form focuses the first invalid field once validation has failed
    await expect.element(screen.getByTestId('login-password-input')).toHaveFocus()
    expect(loginOrRegister).not.toHaveBeenCalled()
    expect(onLoggedIn).not.toHaveBeenCalled()
  })

  it('skips the form for a remembered existing user', async () => {
    saveSessionUserId('u1')
    vi.mocked(isExistingUser).mockResolvedValue(true)

    const { onLoggedIn } = await renderForm()

    await expect.poll(() => onLoggedIn.mock.calls.length).toBe(1)
    expect(isExistingUser).toHaveBeenCalledWith('u1')
  })

  it('forgets a remembered user that no longer exists', async () => {
    saveSessionUserId('u1')
    vi.mocked(isExistingUser).mockResolvedValue(false)

    const { onLoggedIn } = await renderForm()

    await expect.poll(() => getSessionUserId()).toBeNull()
    expect(onLoggedIn).not.toHaveBeenCalled()
  })
})
