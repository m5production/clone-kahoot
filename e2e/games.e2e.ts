import { expect, test } from './support/fixtures'

test.describe('games', () => {
  test('the host creates a titled quiz and finds it on the home page', async ({
    signIn,
  }) => {
    const { page } = await signIn('creator')
    await page.goto('/home')

    await page.getByTestId('create-game-title-input').fill('Geography quiz')
    await page.getByTestId('create-game-button').click()

    await expect(page).toHaveURL(/\/[^/]+\/admin$/)
    const gameId = new URL(page.url()).pathname.split('/')[1]
    await expect(page.getByTestId('questions-sidebar')).toBeVisible()
    await expect(page.getByTestId('game-title-button')).toHaveText(
      'Geography quiz',
    )

    await page.getByTestId('home-link').click()

    const gameItem = page.getByTestId(`game-item-${gameId}`)
    await expect(gameItem).toContainText('Geography quiz')
    await expect(gameItem).toContainText('0 questions')
    await gameItem.getByTestId('game-link').click()
    await expect(page).toHaveURL(`/${gameId}/admin`)
  })

  test('the home page lists only the own quizzes, recently edited first', async ({
    signIn,
    api,
  }) => {
    const owner = await signIn('owner')
    const other = await signIn('other')
    const ownGames = [
      await api.createGame(owner.user, 'First quiz'),
      await api.createGame(owner.user, 'Second quiz'),
    ]
    const foreignGame = await api.createGame(other.user)

    await owner.page.goto('/home')

    const list = owner.page.getByTestId('games-list')
    const items = list.locator('[data-testid^="game-item-"]')
    await expect(items).toHaveCount(2)
    // BR-45: newest edit on top
    await expect(items.nth(0)).toContainText('Second quiz')
    await expect(items.nth(1)).toContainText('First quiz')
    for (const game of ownGames) {
      await expect(list.getByTestId(`game-item-${game.id}`)).toBeVisible()
    }
    await expect(list.getByTestId(`game-item-${foreignGame.id}`)).toHaveCount(0)
  })

  test('the host renames a quiz in the editor', async ({ signIn, api }) => {
    const { page, user } = await signIn('editor')
    const game = await api.createGame(user, 'Old title')
    await page.goto(`/${game.id}/admin`)

    await page.getByTestId('game-title-button').click()
    await page.getByTestId('game-title-input').fill('Fresh title')
    await page.getByTestId('game-title-save-button').click()

    await expect(page.getByTestId('game-title-button')).toHaveText(
      'Fresh title',
    )

    await page.getByTestId('home-link').click()
    await expect(page.getByTestId(`game-item-${game.id}`)).toContainText(
      'Fresh title',
    )
  })

  test('the host deletes a quiz after confirming, questions are gone too', async ({
    signIn,
    api,
  }) => {
    const { page, user } = await signIn('owner')
    const game = await api.createGame(user, 'To be deleted')
    await api.createQuestion(user, game.id, '2+2?', ['4'])
    await page.goto('/home')

    const gameItem = page.getByTestId(`game-item-${game.id}`)
    await expect(gameItem).toContainText('1 question')

    // Cancelling the confirmation keeps the quiz
    await gameItem.getByTestId('delete-button').click()
    await gameItem.getByTestId('cancel-delete-button').click()
    await expect(gameItem).toBeVisible()

    await gameItem.getByTestId('delete-button').click()
    await gameItem.getByTestId('confirm-delete-button').click()

    await expect(page.getByText('Quiz deleted successfully')).toBeVisible()
    await expect(page.getByTestId(`game-item-${game.id}`)).toHaveCount(0)

    // The game is gone with its questions (FR-52)
    const questions = await api.fetchQuestions(user, game.id)
    expect(questions.status()).toBe(404)
  })
})
