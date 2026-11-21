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

const optionInput = (page: Page, index: number) =>
  page
    .getByTestId('question-form')
    .getByTestId(`answer-option-item-${index}`)
    .getByTestId('answer-option-input')

test.describe('choice questions', () => {
  test('the host builds a choice question, the player answers by button, the report shows the picks', async ({
    signIn,
    api,
  }) => {
    const host = await signIn('host')
    const game = await api.createGame(host.user)

    // US-35: the host builds the choice question in the editor UI
    await host.page.goto(`/${game.id}/admin`)
    await host.page.getByTestId('add-question-button').click()
    const form = host.page.getByTestId('question-form')
    await expect(form).toHaveAttribute('aria-busy', 'false')
    await form.getByTestId('question-text-input').fill('The sky is…')

    // the new question has no filled answers, so the type switch needs no confirm
    await host.page.getByTestId('choice-tab').click()
    await expect(form.getByTestId('answer-options-list')).toBeVisible()
    await optionInput(host.page, 0).fill('blue')
    await optionInput(host.page, 1).fill('green')
    await host.page.getByTestId('add-option-button').click()
    await optionInput(host.page, 2).fill('red')
    // 'blue' stays the correct option (the first radio is checked by default)
    await expect(
      form
        .getByTestId('answer-option-item-0')
        .getByTestId('correct-option-input'),
    ).toBeChecked()
    await form.getByTestId('save-question-button').click()
    await expect(
      host.page.getByText('Question saved successfully'),
    ).toBeVisible()

    // a mixed quiz (D-15): the second question is an open one from the API
    await api.createQuestion(host.user, game.id, 'Capital of France?', [
      'Paris',
    ])

    const player = await signIn('player')
    const sessionId = await startSession(host, game.id)
    await joinSession(player, sessionId)
    await host.page.getByTestId('start-game-button').click()

    // US-36: the player answers by tapping a colored option button;
    // the host watches the same options as a list
    await expect(host.page.getByTestId('question-view')).toHaveText(
      'The sky is…',
    )
    await expect(player.page.getByTestId('question-view')).toHaveText(
      'The sky is…',
    )
    await expect(
      host.page.getByTestId('answer-options').getByRole('listitem'),
    ).toHaveText(['blue', 'green', 'red'])
    for (const index of [0, 1, 2]) {
      await expect(
        player.page.getByTestId(`answer-option-${index}`),
      ).toBeEnabled()
    }
    await player.page.getByTestId('answer-option-0').click()
    // the question auto-closes once everyone answered; the buttons unmount, so
    // instant lockout (BR-87) is covered by the component tests instead

    // the question auto-closed (everyone answered) — US-37: the reveal marks
    // the correct option and who picked what on both screens
    await host.page.getByTestId('show-answers-button').click()
    for (const page of [host.page, player.page]) {
      const options = page.getByTestId('answer-options')
      await expect(options.getByRole('listitem').first()).toContainText(
        '✓ blue',
      )
      await expect(
        page.getByTestId(`player-answer-item-${player.user.id}`),
      ).toContainText(`${player.user.name}: blue`)
    }

    // the open question of the mixed quiz still works by text
    await host.page.getByTestId('next-question-button').click()
    await expect(player.page.getByTestId('answer-input')).toBeVisible()
    await player.page.getByTestId('answer-input').fill('Paris')
    await player.page.getByTestId('submit-answer-button').click()
    await host.page.getByTestId('show-answers-button').click()
    await host.page.getByTestId('show-winners-button').click()

    for (const page of [host.page, player.page]) {
      await expect(page.getByTestId('winners-table')).toContainText(
        `1. ${player.user.name}`,
      )
      await expect(page.getByTestId('winners-table')).toContainText('2 correct')
    }

    // US-37/FR-103: the report shows the options with the correct mark and the pick
    await host.page.goto('/history')
    await host.page
      .getByTestId('history-list')
      .getByRole('listitem')
      .first()
      .getByRole('link')
      .click()
    await expect(host.page.getByText('The sky is…')).toBeVisible()
    await expect(host.page.getByText('✓ blue')).toBeVisible()
    await expect(
      host.page
        .locator(
          `[data-testid^="report-answer-"][data-testid$="-${player.user.id}"]`,
        )
        .first(),
    ).toContainText(/blue · \d+\.\d s · \+\d+/)
    // the open question of the mixed quiz keeps its accepted-answers rendering
    await expect(host.page.getByText('Accepted: Paris')).toBeVisible()
  })
})
