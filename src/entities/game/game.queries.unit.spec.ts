import { AxiosError } from 'axios'
import { toast } from 'react-toastify'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { queryClient } from '@/shared/api'
import { fetchGames } from './game.api'
import { GAMES_QUERY } from './game.queries'

vi.mock('react-toastify', () => ({ toast: vi.fn() }))
vi.mock('./game.api', () => ({ fetchGames: vi.fn() }))

afterEach(() => {
  queryClient.clear()
})

describe('GAMES_QUERY', () => {
  it('loads the games', async () => {
    const games = [{ id: 'g1', adminId: 'u1' }]
    vi.mocked(fetchGames).mockResolvedValue(games)

    await expect(
      queryClient.fetchQuery(GAMES_QUERY.queryOptions()),
    ).resolves.toEqual(games)
  })

  it('shows an API error and falls back to an empty list', async () => {
    vi.mocked(fetchGames).mockRejectedValue(new AxiosError('Network Error'))

    await expect(
      queryClient.fetchQuery(GAMES_QUERY.queryOptions()),
    ).resolves.toEqual([])
    expect(toast).toHaveBeenCalledWith('Network Error')
  })

  it('rethrows programming errors', async () => {
    vi.mocked(fetchGames).mockRejectedValue(new TypeError('bug'))

    await expect(
      queryClient.fetchQuery({ ...GAMES_QUERY.queryOptions(), retry: false }),
    ).rejects.toThrow('bug')
  })
})
