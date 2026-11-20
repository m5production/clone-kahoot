import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/shared/test'
import { JoinGameForm } from './join-game.ui'

describe('JoinGameForm', () => {
  it('opens the session for a bare id', async () => {
    const screen = await renderWithProviders(<JoinGameForm />, {
      route: '/home',
    })

    await screen.getByTestId('join-game-input').fill('session-1')
    await screen.getByTestId('join-game-submit-button').click()

    await expect
      .element(screen.getByTestId('test-location'))
      .toHaveTextContent('/join/session-1')
  })

  it('extracts the session id from an invitation link', async () => {
    const screen = await renderWithProviders(<JoinGameForm />, {
      route: '/home',
    })

    await screen
      .getByTestId('join-game-input')
      .fill('https://app.example/join/session-2')
    await screen.getByTestId('join-game-submit-button').click()

    await expect
      .element(screen.getByTestId('test-location'))
      .toHaveTextContent('/join/session-2')
  })

  it('asks for an invitation link', async () => {
    const screen = await renderWithProviders(<JoinGameForm />, {
      route: '/home',
    })

    await screen.getByTestId('join-game-submit-button').click()

    await expect
      .element(screen.getByText('Enter a valid invitation link'))
      .toBeVisible()
    await expect
      .element(screen.getByTestId('join-game-input'))
      .toHaveAttribute('aria-invalid', 'true')
  })
})
