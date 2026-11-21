import type { Page } from '@playwright/test'
import { type Actor, expect, test } from '../support/fixtures'

// Doc 12, NFR-U8: the host game screen below the 768px breakpoint
const MOBILE_CONTEXT = {
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
}

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

test.describe('host game screen on a narrow screen', () => {
  test('the host runs the whole game from a phone', async ({ signIn, api }) => {
    const host = await signIn('host', MOBILE_CONTEXT)
    const game = await api.createGame(host.user)
    await api.createQuestion(host.user, game.id, '2+2?', ['4'])
    await api.createQuestion(host.user, game.id, 'Capital of France?', [
      'Paris',
    ])
    const alice = await signIn('alice')
    const bob = await signIn('bob')

    const sessionId = await startSession(host, game.id)

    for (const player of [alice, bob]) {
      await joinSession(player, sessionId)
      await expect(
        host.page.getByTestId(`player-item-${player.user.id}`),
      ).toHaveText(player.user.name)
    }

    await host.page.getByTestId('start-game-button').click()

    // FR-93: question and timer take the full width, the header shows progress
    await expect(host.page.getByTestId('question-view')).toHaveText('2+2?')
    await expect(host.page.getByTestId('question-timer')).toBeVisible()
    await expect(host.page.getByTestId('question-progress-text')).toHaveText(
      'Question 1 of 2',
    )
    await expect(host.page.getByTestId('answers-progress')).toHaveText(
      '0 of 2 answered',
    )

    // NFR-U8: no horizontal scrolling at 390px
    expect(
      await host.page.evaluate(
        'document.documentElement.scrollWidth - document.documentElement.clientWidth',
      ),
    ).toBeLessThanOrEqual(0)

    // FR-95: the players panel is collapsed until tapped
    await expect(host.page.getByTestId('players-list')).toHaveCount(0)
    await host.page.getByTestId('players-toggle-button').click()
    await expect(
      host.page.getByTestId(`player-item-${alice.user.id}`),
    ).toBeVisible()

    // FR-97: the invite link and QR open from the header mid-game
    await host.page.getByTestId('invite-open-button').click()
    await expect(host.page.getByTestId('invite-link')).toBeVisible()
    await expect(host.page.getByTestId('invite-link-qr')).toBeVisible()
    await host.page
      .getByTestId('invite-dialog')
      .getByRole('button', { name: 'Close' })
      .click()
    await expect(host.page.getByTestId('invite-link')).toHaveCount(0)

    // question 1: Alice answers, Bob does not — the host closes it by hand
    await answer(alice.page, '4')
    await expect(host.page.getByTestId('answers-progress')).toHaveText(
      '1 of 2 answered',
    )
    await host.page.getByTestId('close-question-button').click()
    await host.page.getByTestId('show-answers-button').click()

    // FR-96: the answers are in the main content, not in the players panel
    await expect(
      host.page.getByTestId(`player-answer-item-${alice.user.id}`),
    ).toHaveText(new RegExp(`${alice.user.name}: 4 \\+\\d+`))
    await expect(
      host.page.getByTestId(`player-answer-item-${bob.user.id}`),
    ).toHaveText(`${bob.user.name}: No answer +0`)

    // question 2 (the last one): both are right
    await host.page.getByTestId('next-question-button').click()
    await expect(host.page.getByTestId('question-progress-text')).toHaveText(
      'Question 2 of 2',
    )
    for (const player of [alice, bob]) {
      await answer(player.page, 'Paris')
    }
    await host.page.getByTestId('show-answers-button').click()
    await host.page.getByTestId('show-winners-button').click()

    const rows = host.page.getByTestId('winners-table').getByRole('listitem')
    await expect(rows).toHaveCount(2)
    await expect(rows.nth(0)).toContainText(`1. ${alice.user.name}`)
    await expect(rows.nth(0)).toContainText('2 correct')
    await expect(rows.nth(1)).toContainText(`2. ${bob.user.name}`)
    await expect(rows.nth(1)).toContainText('1 correct')
    await expect(host.page.getByTestId('home-link')).toBeVisible()
  })

  test('the host ends the session from the bottom bar with a confirmation', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host', MOBILE_CONTEXT)
    const game = await api.createGame(host.user)
    await api.createQuestion(host.user, game.id, '2+2?', ['4'])
    const player = await signIn('player')

    const sessionId = await startSession(host, game.id)
    await joinSession(player, sessionId)
    await host.page.getByTestId('start-game-button').click()
    await expect(host.page.getByTestId('question-view')).toBeVisible()

    // FR-70: the first tap only asks for the confirmation
    const endButton = host.page.getByTestId('end-session-button')
    await endButton.click()
    await expect(endButton).toHaveText('Confirm: end the session?')
    await expect(host.page.getByTestId('question-view')).toBeVisible()

    await endButton.click()
    await expect(host.page.getByTestId('session-ended-reason')).toHaveText(
      'The host ended the session',
    )
    await expect(player.page.getByTestId('session-ended-reason')).toHaveText(
      'The host ended the session',
    )

    await host.page.getByTestId('home-link').click()
    await expect(host.page).toHaveURL('/home')
  })
})
