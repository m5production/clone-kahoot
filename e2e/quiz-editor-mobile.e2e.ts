import type { Page } from '@playwright/test'
import { expect, test } from './support/fixtures'

// Doc 11, NFR-U7: the mobile editor layout below the 768px breakpoint
const MOBILE_CONTEXT = {
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
}

const questionForm = (page: Page) => page.getByTestId('question-form')
const navBar = (page: Page) => page.getByTestId('editor-nav-bar')
const questionsTab = (page: Page) => navBar(page).getByTestId('questions-tab')
const questionTab = (page: Page) => navBar(page).getByTestId('question-tab')

test.describe('quiz editor on a narrow screen', () => {
  test('switches between the question list and the editor via the bottom nav', async ({
    signIn,
    api,
  }) => {
    const { page, user } = await signIn('editor', MOBILE_CONTEXT)
    const game = await api.createGame(user)
    const first = await api.createQuestion(user, game.id, 'First?', ['1'])
    await api.createQuestion(user, game.id, 'Second?', ['2'])
    await page.goto(`/${game.id}/admin`)

    // FR-88: one section at a time — the list first, the nav bar is pinned
    await expect(questionsTab(page)).toHaveAttribute('aria-current', 'page')
    await expect(questionTab(page)).toHaveText('Question')
    await expect(page.getByTestId('questions-list')).toBeVisible()
    await expect(questionForm(page)).toHaveCount(0)
    // FR-92: the title stays in the header
    await expect(page.getByTestId('game-title-button')).toBeVisible()
    // NFR-U7: usable without horizontal scrolling at 390px
    expect(
      await page.evaluate(
        'document.documentElement.scrollWidth - document.documentElement.clientWidth',
      ),
    ).toBeLessThanOrEqual(0)

    // FR-89: picking a question opens the Question section
    await page.getByTestId(`question-item-${first.id}`).click()
    await expect(questionTab(page)).toHaveAttribute('aria-current', 'page')
    await expect(questionTab(page)).toHaveText('Question 1')
    await expect(questionForm(page)).toBeVisible()
    await expect(page.getByTestId('questions-list')).toHaveCount(0)

    // the selected question is kept while switching sections
    await questionsTab(page).click()
    await expect(page.getByTestId('questions-list')).toBeVisible()
    await questionTab(page).click()
    await expect(
      questionForm(page).getByRole('heading', { name: 'Question #1' }),
    ).toBeVisible()
  })

  test('adding a question opens the Question tab; deleting it returns to the list', async ({
    signIn,
    api,
  }) => {
    const { page, user } = await signIn('editor', MOBILE_CONTEXT)
    const game = await api.createGame(user)
    await page.goto(`/${game.id}/admin`)

    // nothing selected: the Question section shows an empty state
    await questionTab(page).click()
    await expect(
      page.getByText('Select a question on the Questions tab or add a new one'),
    ).toBeVisible()

    // FR-89: "Add new question" opens the new question in the Question section
    await questionsTab(page).click()
    await page.getByTestId('add-question-button').click()
    await expect(questionForm(page)).toBeVisible()
    await expect(questionTab(page)).toHaveAttribute('aria-current', 'page')

    // FR-89: deleting the open question returns to the Questions section
    await page.getByTestId('delete-question-button').click()
    await expect(page.getByText('Question deleted successfully')).toBeVisible()
    await expect(questionsTab(page)).toHaveAttribute('aria-current', 'page')
    // back on the Questions section — the list is empty now
    await expect(page.getByTestId('questions-sidebar')).toBeVisible()
  })

  test('an unready quiz counts incomplete questions and the FAB explains why it cannot start', async ({
    signIn,
    api,
  }) => {
    const { page, user } = await signIn('editor', MOBILE_CONTEXT)
    const game = await api.createGame(user)
    await api.createQuestion(user, game.id, '', [])
    await api.createQuestion(user, game.id, '2+2?', [])
    await api.createQuestion(user, game.id, '3+3?', ['6'])
    await page.goto(`/${game.id}/admin`)

    // FR-90: the Questions tab badge shows the number of unready questions
    await expect(questionsTab(page).getByText('2')).toBeVisible()

    // FR-91: the FAB is dimmed but still tappable, the tap explains the reason
    const startFab = page.getByTestId('start-game-button')
    await expect(startFab).toHaveAttribute('aria-disabled', 'true')
    // aria-disabled stays tappable for real users; Playwright treats it as
    // disabled for actionability, so the check is bypassed on purpose
    await startFab.click({ force: true })
    await expect(
      page.getByText(
        'You need to fill question text and provide accepted answers to all the questions',
      ),
    ).toBeVisible()
    await expect(page).toHaveURL(`/${game.id}/admin`)

    // the FAB stays on screen in the Question section too (D-11)
    await questionTab(page).click()
    await expect(startFab).toBeVisible()
  })

  test('a ready quiz starts from the FAB and opens the lobby', async ({
    signIn,
    api,
  }) => {
    const { page, user } = await signIn('host', MOBILE_CONTEXT)
    const game = await api.createGame(user)
    await api.createQuestion(user, game.id, '2+2?', ['4'])
    await page.goto(`/${game.id}/admin`)

    await page.getByTestId('start-session-button').click()
    await expect(page).toHaveURL(/\/join\/[^/]+$/)
    await expect(page.getByTestId('host-controls')).toBeVisible()
  })
})
