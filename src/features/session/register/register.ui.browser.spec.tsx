import { toast } from 'react-toastify'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { registerUser } from './register.service'
import { RegisterForm } from './register.ui'

vi.mock('react-toastify', () => ({ toast: vi.fn() }))
vi.mock('./register.service', () => ({
  registerUser: vi.fn(),
}))

const renderForm = async () => {
  const onRegistered = vi.fn()
  const screen = await render(<RegisterForm onRegistered={onRegistered} />)

  return { screen, onRegistered }
}

describe('RegisterForm', () => {
  it('registers the user and reports success', async () => {
    vi.mocked(registerUser).mockResolvedValue({
      id: 'u1',
      name: 'alice',
      token: 't1',
    })
    const { screen, onRegistered } = await renderForm()

    await screen.getByTestId('register-name-input').fill('alice')
    await screen.getByTestId('register-password-input').fill('secret-password')
    await screen.getByTestId('register-submit-button').click()

    await expect.poll(() => onRegistered.mock.calls.length).toBe(1)
    expect(registerUser).toHaveBeenCalledWith({
      name: 'alice',
      password: 'secret-password',
    })
  })

  it('does not submit without a nickname and a password', async () => {
    const { screen, onRegistered } = await renderForm()

    await screen.getByTestId('register-name-input').fill('alice')
    await screen.getByTestId('register-submit-button').click()

    // react-hook-form focuses the first invalid field once validation has failed
    await expect
      .element(screen.getByTestId('register-password-input'))
      .toHaveFocus()
    expect(registerUser).not.toHaveBeenCalled()
    expect(onRegistered).not.toHaveBeenCalled()
  })

  it('shows the server error for a taken name', async () => {
    vi.mocked(registerUser).mockRejectedValue(
      new Error('There is a user with such a name'),
    )
    const { screen, onRegistered } = await renderForm()

    await screen.getByTestId('register-name-input').fill('alice')
    await screen.getByTestId('register-password-input').fill('secret-password')
    await screen.getByTestId('register-submit-button').click()

    await expect.poll(() => vi.mocked(toast).mock.calls.length).toBe(1)
    expect(onRegistered).not.toHaveBeenCalled()
  })
})
