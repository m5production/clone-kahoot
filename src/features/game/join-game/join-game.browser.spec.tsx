import { AxiosError, AxiosHeaders } from 'axios'
import { toast } from 'react-toastify'
import { describe, expect, it, vi } from 'vitest'
import { checkActiveGame } from '@/entities/game'
import { renderWithProviders } from '@/shared/test'
import { JoinGameForm } from './join-game.ui'

vi.mock('react-toastify', () => ({ toast: vi.fn() }))
vi.mock('@/entities/game', () => ({ checkActiveGame: vi.fn() }))

describe('JoinGameForm', () => {
  it('opens the running game for the player', async () => {
    vi.mocked(checkActiveGame).mockResolvedValue()
    const screen = await renderWithProviders(<JoinGameForm />, {
      route: '/home',
    })

    await screen.getByTestId('join-game-input').fill('game-1')
    await screen.getByTestId('join-game-submit-button').click()

    await expect
      .element(screen.getByTestId('test-location'))
      .toHaveTextContent('/game-1/player')
    expect(checkActiveGame).toHaveBeenCalledWith('game-1')
  })

  it('asks for a game link', async () => {
    const screen = await renderWithProviders(<JoinGameForm />, {
      route: '/home',
    })

    await screen.getByTestId('join-game-submit-button').click()

    await expect
      .element(screen.getByText('Enter valid game link'))
      .toBeVisible()
    await expect
      .element(screen.getByTestId('join-game-input'))
      .toHaveAttribute('aria-invalid', 'true')
    expect(checkActiveGame).not.toHaveBeenCalled()
  })

  it('stays on the page and shows why the game cannot be joined', async () => {
    vi.mocked(checkActiveGame).mockRejectedValue(
      new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 404,
          statusText: '',
          data: 'There is no active game at the moment',
          headers: {},
          config: { headers: new AxiosHeaders() },
        },
      ),
    )
    const screen = await renderWithProviders(<JoinGameForm />, {
      route: '/home',
    })

    await screen.getByTestId('join-game-input').fill('game-1')
    await screen.getByTestId('join-game-submit-button').click()

    await expect.poll(() => vi.mocked(toast).mock.calls.length).toBe(1)
    expect(toast).toHaveBeenCalledWith('There is no active game at the moment')
    await expect
      .element(screen.getByTestId('test-location'))
      .toHaveTextContent('/home')
  })
})
