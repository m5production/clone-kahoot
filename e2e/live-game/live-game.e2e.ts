import type { Page } from '@playwright/test'
import { type Actor, expect, test } from '../support/fixtures'

/** Host: quiz editor → start session → lands on /join/<sessionId> as the host */
const startSession = async (host: Actor, gameId: string) => {
  await host.page.goto(`/${gameId}/admin`)
  await host.page.getByTestId('start-session-button').click()
  await expect(host.page).toHaveURL(/\/join\/[^/]+$/)
  await expect(host.page.getByTestId('host-controls')).toBeVisible()

  return new URL(host.page.url()).pathname.split('/').at(-1) as string
}

/** Player: paste the invitation link on the home page → /join/<sessionId> lobby */
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

test.describe('live session', () => {
  test('a player sees an error for a session that does not exist', async ({
    signIn,
  }) => {
    const player = await signIn('player')

    await player.page.goto('/join/no-such-session')
    await expect(player.page.getByTestId('session-unavailable')).toBeVisible()
    await player.page.getByTestId('home-link').click()
    await expect(player.page).toHaveURL('/home')
  })

  test('host and two players play a quiz to the winners', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const game = await api.createGame(host.user)
    await api.createQuestion(host.user, game.id, '2+2?', ['4'])
    await api.createQuestion(host.user, game.id, 'Capital of France?', [
      'Paris',
    ])
    const alice = await signIn('alice')
    const bob = await signIn('bob')

    const sessionId = await startSession(host, game.id)

    // lobby: players join, the host sees them
    for (const player of [alice, bob]) {
      await joinSession(player, sessionId)
      await expect(
        host.page.getByTestId(`player-item-${player.user.id}`),
      ).toHaveText(player.user.name)
    }
    await expect(
      host.page.getByRole('heading', { name: 'Players (2)' }),
    ).toBeVisible()
    await expect(host.page.getByTestId('invite-link')).toBeVisible()

    await host.page.getByTestId('start-game-button').click()
    await expect(host.page.getByTestId('question-view')).toHaveText('2+2?')
    await expect(host.page.getByTestId('question-progress-text')).toHaveText(
      'Question 1 of 2',
    )
    for (const player of [alice, bob]) {
      await expect(player.page.getByTestId('question-view')).toHaveText('2+2?')
    }

    // Question 1: Alice is right, Bob is wrong — the question auto-closes once
    // everyone answered, so the host goes straight to "show answers"
    await answer(alice.page, '4')
    await expect(alice.page.getByTestId('submit-answer-button')).toBeDisabled()
    await answer(bob.page, '5')
    await host.page.getByTestId('show-answers-button').click()

    for (const page of [host.page, alice.page]) {
      await expect(
        page.getByTestId(`player-answer-item-${alice.user.id}`),
      ).toHaveText(`${alice.user.name}: 4`)
      await expect(
        page.getByTestId(`player-answer-item-${bob.user.id}`),
      ).toHaveText(`${bob.user.name}: 5`)
    }

    // Question 2 (the last one): both are right
    await host.page.getByTestId('next-question-button').click()
    await expect(host.page.getByTestId('question-progress-text')).toHaveText(
      'Question 2 of 2',
    )
    for (const player of [alice, bob]) {
      await expect(player.page.getByTestId('question-view')).toHaveText(
        'Capital of France?',
      )
      await answer(player.page, 'Paris')
    }
    await host.page.getByTestId('show-answers-button').click()
    await host.page.getByTestId('show-winners-button').click()

    const expectedWinners = [
      `1. ${alice.user.name}: 2`,
      `2. ${bob.user.name}: 1`,
    ]
    for (const page of [host.page, alice.page, bob.page]) {
      await expect(
        page.getByTestId('winners-table').getByRole('listitem'),
      ).toHaveText(expectedWinners)
      await expect(page.getByTestId('home-link')).toBeVisible()
    }
  })

  test('a reconnecting player keeps their seat and answers', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const game = await api.createGame(host.user)
    await api.createQuestion(host.user, game.id, '2+2?', ['4'])
    const player = await signIn('player')
    // a second player keeps the question open while the first one reloads
    const other = await signIn('other')

    const sessionId = await startSession(host, game.id)
    await joinSession(player, sessionId)
    await joinSession(other, sessionId)
    await host.page.getByTestId('start-game-button').click()

    await answer(player.page, '4')
    await expect(player.page.getByTestId('submit-answer-button')).toBeDisabled()

    // reload = new socket, JOIN_SESSION restores the seat (BR-58) and the
    // stored answer is echoed back into the locked form
    await player.page.reload()
    await expect(player.page.getByTestId('submit-answer-button')).toBeDisabled()
    await expect(player.page.getByTestId('answer-input')).toHaveValue('4')
    await expect(
      host.page.getByTestId(`player-item-${player.user.id}`),
    ).toBeVisible()
  })

  test('the quiz can not be edited while its session runs (BR-54)', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const game = await api.createGame(host.user)
    await api.createQuestion(host.user, game.id, '2+2?', ['4'])

    const sessionId = await startSession(host, game.id)

    // the host can leave the session screen — the room lives on in the grace period
    await host.page.goto(`/${game.id}/admin`)
    await host.page.getByTestId('game-title-button').click()
    await host.page.getByTestId('game-title-input').fill('Renamed')
    await host.page.getByTestId('game-title-save-button').click()
    await expect(host.page.getByText('A live session is running')).toBeVisible()

    // …and can come back to the still-running session
    await host.page.goto(`/join/${sessionId}`)
    await expect(host.page.getByTestId('host-controls')).toBeVisible()
  })

  test('the join form asks for an invitation link', async ({ signIn }) => {
    const { page } = await signIn('player')
    await page.goto('/home')

    await page.getByTestId('join-game-submit-button').click()

    await expect(page.getByText('Enter a valid invitation link')).toBeVisible()
    await expect(page.getByTestId('join-game-input')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
