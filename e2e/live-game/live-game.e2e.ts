import type { Page } from '@playwright/test'
import type { TestQuestion } from '../support/api'
import { type Actor, expect, test } from '../support/fixtures'

const startGame = async (host: Actor, gameId: string) => {
  await host.page.goto(`/${gameId}/admin`)
  await host.page.getByTestId('start-game-link').click()
  await expect(host.page).toHaveURL(`/${gameId}/admin/activeGame`)
  await expect(host.page.getByTestId('host-controls')).toBeVisible()
}

const joinGame = async (player: Actor, gameId: string) => {
  await player.page.goto('/home')
  await player.page.getByTestId('join-game-input').fill(gameId)
  await player.page.getByTestId('join-game-submit-button').click()
  await expect(player.page).toHaveURL(`/${gameId}/player`)
}

const answer = async (page: Page, text: string) => {
  await page.getByTestId('answer-input').fill(text)
  await page.getByTestId('submit-answer-button').click()
}

const switchQuestion = (host: Actor, question: TestQuestion) =>
  host.page
    .getByTestId(`host-question-item-${question.id}`)
    .getByTestId('switch-question-button')
    .click()

test.describe('live game', () => {
  // First: a game left running by an earlier test would answer 403 instead of 404
  test('a player cannot join a quiz that is not running', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const game = await api.createGame(host.user)
    const player = await signIn('player')

    await player.page.goto('/home')
    await player.page.getByTestId('join-game-input').fill(game.id)
    await player.page.getByTestId('join-game-submit-button').click()

    await expect(
      player.page.getByText(`No game with id ${game.id} is currently running`),
    ).toBeVisible()
    await expect(player.page).toHaveURL('/home')
  })

  test('host and two players play a quiz to the winners', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const game = await api.createGame(host.user)
    const q1 = await api.createQuestion(host.user, game.id, '2+2?', ['4'])
    const q2 = await api.createQuestion(
      host.user,
      game.id,
      'Capital of France?',
      ['Paris'],
    )
    const alice = await signIn('alice')
    const bob = await signIn('bob')

    await startGame(host, game.id)
    await expect(host.page.getByTestId('question-view')).toHaveText('2+2?')
    await expect(
      host.page.locator('[data-testid^="host-question-item-"]'),
    ).toHaveCount(2)

    for (const player of [alice, bob]) {
      await joinGame(player, game.id)
      await expect(player.page.getByTestId('question-view')).toHaveText('2+2?')
      await expect(
        host.page.getByTestId(`player-item-${player.user.id}`),
      ).toHaveText(player.user.name)
    }
    await expect(
      host.page.getByRole('heading', { name: 'Players (2)' }),
    ).toBeVisible()
    await expect(
      alice.page.getByRole('heading', { name: 'Players (2)' }),
    ).toBeVisible()

    // Question 1: Alice is right, Bob is wrong
    await answer(alice.page, '4')
    await expect(alice.page.getByTestId('submit-answer-button')).toBeDisabled()
    await expect(alice.page.getByTestId('answer-input')).toHaveValue('4')
    await answer(bob.page, '5')
    await expect(bob.page.getByTestId('submit-answer-button')).toBeDisabled()

    await host.page.getByTestId('show-answers-button').click()
    for (const page of [host.page, alice.page]) {
      await expect(
        page.getByTestId(`player-answer-item-${alice.user.id}`),
      ).toHaveText(`${alice.user.name}: 4`)
      await expect(
        page.getByTestId(`player-answer-item-${bob.user.id}`),
      ).toHaveText(`${bob.user.name}: 5`)
    }

    // Question 2: both are right
    await switchQuestion(host, q2)
    for (const player of [alice, bob]) {
      await expect(player.page.getByTestId('question-view')).toHaveText(
        'Capital of France?',
      )
      await expect(
        player.page.getByTestId('submit-answer-button'),
      ).toBeEnabled()
      await expect(player.page.getByTestId('players-list')).toBeVisible()
      await answer(player.page, 'Paris')
      await expect(
        player.page.getByTestId('submit-answer-button'),
      ).toBeDisabled()
    }

    // Going back keeps the answers given to question 1
    await switchQuestion(host, q1)
    await expect(alice.page.getByTestId('question-view')).toHaveText('2+2?')
    await expect(alice.page.getByTestId('answer-input')).toHaveValue('4')
    await expect(alice.page.getByTestId('answer-input')).toBeDisabled()

    await host.page.getByTestId('show-winners-button').click()

    const expectedWinners = [
      `1. ${alice.user.name}: 2`,
      `2. ${bob.user.name}: 1`,
    ]
    await expect(
      host.page.getByTestId('winners-table').getByRole('listitem'),
    ).toHaveText(expectedWinners)
    for (const player of [alice, bob]) {
      await expect(player.page).toHaveURL(`/${game.id}/player/winners`)
      await expect(
        player.page.getByTestId('winners-table').getByRole('listitem'),
      ).toHaveText(expectedWinners)
    }

    await expect(host.page.getByTestId('show-winners-button')).toBeDisabled()
    await host.page.getByTestId('stop-game-button').click()
    await host.page.getByTestId('home-link').click()
    await expect(host.page).toHaveURL('/home')

    await alice.page.getByTestId('home-link').click()
    await expect(alice.page).toHaveURL('/home')
  })

  test('host and player play a second quiz without reloading the tab', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const first = await api.createGame(host.user)
    await api.createQuestion(host.user, first.id, 'First quiz?', ['1'])
    const second = await api.createGame(host.user)
    await api.createQuestion(host.user, second.id, 'Second quiz?', ['2'])
    const player = await signIn('player')

    await startGame(host, first.id)
    await joinGame(player, first.id)
    await expect(player.page.getByTestId('question-view')).toHaveText(
      'First quiz?',
    )
    await host.page.getByTestId('show-winners-button').click()
    await expect(player.page).toHaveURL(`/${first.id}/player/winners`)
    await host.page.getByTestId('stop-game-button').click()

    // Only in-app navigation from here on: the tab keeps its JavaScript state
    await host.page.getByTestId('home-link').click()
    await host.page
      .getByTestId(`game-item-${second.id}`)
      .getByTestId('game-link')
      .click()
    await host.page.getByTestId('start-game-link').click()
    await expect(host.page.getByTestId('question-view')).toHaveText(
      'Second quiz?',
    )

    await player.page.getByTestId('home-link').click()
    await player.page.getByTestId('join-game-input').fill(second.id)
    await player.page.getByTestId('join-game-submit-button').click()
    await expect(player.page).toHaveURL(`/${second.id}/player`)
    await expect(player.page.getByTestId('question-view')).toHaveText(
      'Second quiz?',
    )
    await expect(
      host.page.getByTestId(`player-item-${player.user.id}`),
    ).toBeVisible()
  })

  test('a host leaving the game page ends the game', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const game = await api.createGame(host.user)
    await api.createQuestion(host.user, game.id, '2+2?', ['4'])
    await startGame(host, game.id)
    await expect(host.page.getByTestId('question-view')).toHaveText('2+2?')

    await host.page.goBack()
    await expect(host.page).toHaveURL(`/${game.id}/admin`)

    const player = await signIn('player')
    await player.page.goto('/home')
    await player.page.getByTestId('join-game-input').fill(game.id)
    await player.page.getByTestId('join-game-submit-button').click()
    await expect(
      player.page.getByText(`No game with id ${game.id} is currently running`),
    ).toBeVisible()
  })

  test('a player cannot join another quiz while one is running', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const running = await api.createGame(host.user)
    await api.createQuestion(host.user, running.id, '2+2?', ['4'])
    const other = await api.createGame(host.user)
    await startGame(host, running.id)
    await expect(host.page.getByTestId('question-view')).toHaveText('2+2?')

    const player = await signIn('player')
    await player.page.goto('/home')
    await player.page.getByTestId('join-game-input').fill(other.id)
    await player.page.getByTestId('join-game-submit-button').click()

    await expect(
      player.page.getByText(`No game with id ${other.id} is currently running`),
    ).toBeVisible()
    await expect(player.page).toHaveURL('/home')
  })

  test('the join form asks for a game link', async ({ signIn }) => {
    const { page } = await signIn('player')
    await page.goto('/home')

    await page.getByTestId('join-game-submit-button').click()

    await expect(page.getByText('Enter valid game link')).toBeVisible()
    await expect(page.getByTestId('join-game-input')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
