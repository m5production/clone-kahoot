import type { Page } from '@playwright/test'
import type { Api } from './support/api'
import { type Actor, expect, test } from './support/fixtures'

const startSession = async (host: Actor, gameId: string) => {
  await host.page.goto(`/${gameId}/admin`)
  await host.page.getByTestId('start-session-button').click()
  await expect(host.page).toHaveURL(/\/join\/[^/]+$/)
  await expect(host.page.getByTestId('host-controls')).toBeVisible()

  return new URL(host.page.url()).pathname.split('/').at(-1) as string
}

const joinSession = async (player: Actor, sessionId: string) => {
  await player.page.goto('/home')
  await player.page.getByTestId('join-game-input').fill(`/join/${sessionId}`)
  await player.page.getByTestId('join-game-submit-button').click()
  await expect(player.page).toHaveURL(`/join/${sessionId}`)
}

const answer = async (page: Page, text: string) => {
  await page.getByTestId('answer-input').fill(text)
  await page.getByTestId('submit-answer-button').click()
}

/** One host, one player, one question — played to the winners screen */
const playOneQuestionGame = async (host: Actor, player: Actor, api: Api) => {
  const game = await api.createGame(host.user)
  await api.createQuestion(host.user, game.id, '2+2?', ['4'])

  const sessionId = await startSession(host, game.id)
  await joinSession(player, sessionId)
  await host.page.getByTestId('start-game-button').click()

  await answer(player.page, '4')
  await host.page.getByTestId('show-answers-button').click()
  await host.page.getByTestId('show-winners-button').click()
  await expect(host.page.getByTestId('winners-table')).toBeVisible()

  return { game, sessionId }
}

test.describe('game history', () => {
  test('a finished game appears in the history and the report shows its answers', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const player = await signIn('player')
    await playOneQuestionGame(host, player, api)

    await host.page.goto('/history')
    const item = host.page.getByTestId('history-list').getByRole('listitem')
    await expect(item).toHaveCount(1)
    await expect(item.first()).toContainText('Test quiz')
    await expect(item.first()).toContainText('Finished')
    await expect(item.first()).toContainText('1 player')
    await expect(item.first()).toContainText(`Winner: ${player.user.name}`)

    await item.first().getByRole('link').click()
    await expect(host.page.getByTestId('winners-table')).toContainText(
      `1. ${player.user.name}`,
    )
    await expect(host.page.getByText('2+2?')).toBeVisible()
    await expect(host.page.getByText('Accepted: 4')).toBeVisible()
    await expect(
      host.page.getByText(new RegExp(`${player.user.name}`)).last(),
    ).toBeVisible()
    await expect(host.page.getByText(/4 · \d+\.\d s · \+\d+/)).toBeVisible()
  })

  test('an aborted session is recorded as aborted', async ({ signIn, api }) => {
    const host = await signIn('host')
    const game = await api.createGame(host.user)
    await api.createQuestion(host.user, game.id, '2+2?', ['4'])
    const player = await signIn('player')

    const sessionId = await startSession(host, game.id)
    await joinSession(player, sessionId)
    await host.page.getByTestId('start-game-button').click()

    // end the session mid-question: the record lands in history as aborted
    await host.page.getByTestId('end-session-button').click()
    await host.page.getByTestId('end-session-button').click()

    await host.page.goto('/history')
    const item = host.page.getByTestId('history-list').getByRole('listitem')
    await expect(item.first()).toContainText('Aborted')
  })

  test('deleting the quiz keeps its history (BR-81)', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const player = await signIn('player')
    const { game } = await playOneQuestionGame(host, player, api)

    await host.page.goto('/home')
    const gameItem = host.page.getByTestId(`game-item-${game.id}`)
    await gameItem.getByTestId('delete-button').click()
    await gameItem.getByTestId('confirm-delete-button').click()
    await expect(gameItem).not.toBeVisible()

    await host.page.goto('/history')
    const item = host.page.getByTestId('history-list').getByRole('listitem')
    await expect(item.first()).toContainText('Test quiz')

    // the report still opens with the copied quiz title and questions
    await item.first().getByRole('link').click()
    await expect(host.page.getByText('2+2?')).toBeVisible()
  })

  test('another host can not see or delete the record (BR-81)', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const player = await signIn('player')
    const { sessionId } = await playOneQuestionGame(host, player, api)

    const other = await signIn('other')
    await other.page.goto('/history')
    await expect(other.page.getByTestId('history-empty')).toBeVisible()

    await other.page.goto(`/history/${sessionId}`)
    await expect(other.page.getByTestId('report-unavailable')).toBeVisible()
  })

  test('the host deletes a record after confirming (FR-82)', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const player = await signIn('player')
    await playOneQuestionGame(host, player, api)

    await host.page.goto('/history')
    await host.page
      .getByTestId('history-list')
      .getByRole('listitem')
      .first()
      .getByRole('link')
      .click()

    await host.page.getByTestId('delete-session-button').click()
    await host.page.getByTestId('cancel-delete-session-button').click()
    await host.page.getByTestId('delete-session-button').click()
    await host.page.getByTestId('confirm-delete-session-button').click()

    await expect(host.page).toHaveURL('/history')
    await expect(host.page.getByTestId('history-empty')).toBeVisible()
  })
})
