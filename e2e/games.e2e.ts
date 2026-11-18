import { expect, test } from './support/fixtures'

test.describe('games', () => {
  test('the host creates a quiz and finds it on the home page', async ({ signIn }) => {
    const { page } = await signIn('creator')
    await page.goto('/home')

    await page.getByTestId('create-game-button').click()

    await expect(page).toHaveURL(/\/[^/]+\/admin$/)
    const gameId = new URL(page.url()).pathname.split('/')[1]
    await expect(page.getByTestId('questions-sidebar')).toBeVisible()

    await page.getByTestId('home-link').click()

    const gameItem = page.getByTestId(`game-item-${gameId}`)
    await expect(gameItem).toHaveText('Quiz #1')
    await gameItem.getByTestId('game-link').click()
    await expect(page).toHaveURL(`/${gameId}/admin`)
  })

  test('the home page lists only the own quizzes', async ({ signIn, api }) => {
    const owner = await signIn('owner')
    const other = await signIn('other')
    const ownGames = [await api.createGame(owner.user.id), await api.createGame(owner.user.id)]
    const foreignGame = await api.createGame(other.user.id)

    await owner.page.goto('/home')

    const list = owner.page.getByTestId('games-list')
    await expect(list.locator('[data-testid^="game-item-"]')).toHaveCount(2)
    for (const game of ownGames) {
      await expect(list.getByTestId(`game-item-${game.id}`)).toBeVisible()
    }
    await expect(list.getByTestId(`game-item-${foreignGame.id}`)).toHaveCount(0)
  })
})
