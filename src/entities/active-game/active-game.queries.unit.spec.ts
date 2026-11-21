import { AxiosError } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { queryClient } from '@/shared/api'
import { fetchSessionSummary } from './active-game.api'
import { SESSION_SUMMARY_QUERY } from './active-game.queries'
import type { SessionSummary } from './active-game.types'

vi.mock('./active-game.api', () => ({
  createSession: vi.fn(),
  fetchSessionSummary: vi.fn(),
}))

afterEach(() => {
  queryClient.clear()
})

describe('SESSION_SUMMARY_QUERY', () => {
  it('loads the session summary', async () => {
    const summary: SessionSummary = {
      state: 'lobby',
      quizTitle: 'Geography',
      hostName: 'bob',
    }
    vi.mocked(fetchSessionSummary).mockResolvedValue(summary)

    await expect(
      queryClient.fetchQuery(SESSION_SUMMARY_QUERY.queryOptions('s1')),
    ).resolves.toEqual(summary)
  })

  it('propagates API errors — the join page renders them itself', async () => {
    vi.mocked(fetchSessionSummary).mockRejectedValue(
      new AxiosError('Request failed'),
    )

    await expect(
      queryClient.fetchQuery(SESSION_SUMMARY_QUERY.queryOptions('s1')),
    ).rejects.toThrow('Request failed')
  })
})
