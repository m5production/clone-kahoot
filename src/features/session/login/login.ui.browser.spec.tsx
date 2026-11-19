import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import {
  getSessionToken,
  getSessionUserId,
  saveSessionToken,
} from '@/entities/session'
import { fetchSessionUser, loginOrRegister } from './login.service'
import { LoginForm } from './login.ui'

vi.mock('./login.service', () => ({
  loginOrRegister: vi.fn(),
  fetchSessionUser: vi.fn(),
}))

const renderForm = async () => {
  const onLoggedIn = vi.fn()
  const screen = await render(<LoginForm onLoggedIn={onLoggedIn} />)

  return { screen, onLoggedIn }
}

describe('LoginForm', () => {
  it('logs in, remembers the user and reports success', async () => {
    vi.mocked(loginOrRegister).mockResolvedValue({
      id: 'u1',
      name: 'alice',
      token: 't1',
    })
    const { screen, onLoggedIn } = await renderForm()

    await screen.getByTestId('login-name-input').fill('alice')
    await screen.getByTestId('login-password-input').fill('secret')
    await screen.getByTestId('login-submit-button').click()

    await expect.poll(() => onLoggedIn.mock.calls.length).toBe(1)
    expect(loginOrRegister).toHaveBeenCalledWith({
      name: 'alice',
      password: 'secret',
    })
    expect(getSessionUserId()).toBe('u1')
    expect(getSessionToken()).toBe('t1')
  })

  it('does not submit without a nickname and a password', async () => {
    const { screen, onLoggedIn } = await renderForm()

    await screen.getByTestId('login-name-input').fill('alice')
    await screen.getByTestId('login-submit-button').click()

    // react-hook-form focuses the first invalid field once validation has failed
    await expect
      .element(screen.getByTestId('login-password-input'))
      .toHaveFocus()
    expect(loginOrRegister).not.toHaveBeenCalled()
    expect(onLoggedIn).not.toHaveBeenCalled()
  })

  it('skips the form when the stored session is still valid', async () => {
    saveSessionToken('t1')
    vi.mocked(fetchSessionUser).mockResolvedValue({ id: 'u1', name: 'alice' })

    const { onLoggedIn } = await renderForm()

    await expect.poll(() => onLoggedIn.mock.calls.length).toBe(1)
    expect(getSessionUserId()).toBe('u1')
  })

  it('forgets a stored session that is no longer valid', async () => {
    saveSessionToken('stale')
    vi.mocked(fetchSessionUser).mockResolvedValue(null)

    const { onLoggedIn } = await renderForm()

    await expect.poll(() => getSessionToken()).toBeNull()
    expect(onLoggedIn).not.toHaveBeenCalled()
  })

  it('does not call the backend without a stored token', async () => {
    const { onLoggedIn } = await renderForm()

    expect(fetchSessionUser).not.toHaveBeenCalled()
    expect(onLoggedIn).not.toHaveBeenCalled()
  })
})
