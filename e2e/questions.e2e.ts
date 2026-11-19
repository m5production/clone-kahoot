import type { Page } from '@playwright/test'
import { expect, test } from './support/fixtures'

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

const questionForm = (page: Page) => page.getByTestId('question-form')
const answerInput = (page: Page, index: number) =>
  questionForm(page)
    .getByTestId(`accepted-answer-item-${index}`)
    .getByTestId('accepted-answer-input')
const questionItems = (page: Page) =>
  page.getByTestId('questions-list').locator('[data-testid^="question-item-"]')

test.describe('quiz editor', () => {
  test('the host adds a question with an image and accepted answers', async ({
    signIn,
    api,
  }) => {
    const { page, user } = await signIn('editor')
    const game = await api.createGame(user)
    await page.goto(`/${game.id}/admin`)

    await page.getByTestId('add-question-button').click()

    const form = questionForm(page)
    await expect(
      form.getByRole('heading', { name: 'Question #1' }),
    ).toBeVisible()
    await expect(form).toHaveAttribute('aria-busy', 'false')
    await expect(questionItems(page)).toHaveCount(1)
    // A new question comes with one empty answer field
    await expect(
      form.getByTestId('accepted-answers-list').getByRole('listitem'),
    ).toHaveCount(1)
    await expect(answerInput(page, 0)).toHaveValue('')

    await form.getByTestId('question-image-input').fill(PIXEL)
    await form.getByTestId('question-text-input').fill('Capital of France?')
    await answerInput(page, 0).fill('Paris')
    await form.getByTestId('add-answer-button').click()
    await answerInput(page, 1).fill('paris')
    await form.getByTestId('save-question-button').click()

    await expect(page.getByText('Question updated successfully')).toBeVisible()
    await expect(
      page.getByText('Accepted answers updated successfully'),
    ).toBeVisible()

    await page.reload()
    await questionItems(page).first().click()

    await expect(form).toHaveAttribute('aria-busy', 'false')
    await expect(form.getByTestId('question-text-input')).toHaveValue(
      'Capital of France?',
    )
    await expect(form.getByTestId('question-image-input')).toHaveValue(PIXEL)
    await expect(
      form.getByRole('img', { name: 'Question illustration' }),
    ).toBeVisible()
    await expect(answerInput(page, 0)).toHaveValue('Paris')
    await expect(answerInput(page, 1)).toHaveValue('paris')
  })

  test('the host edits a question', async ({ signIn, api }) => {
    const { page, user } = await signIn('editor')
    const game = await api.createGame(user)
    const question = await api.createQuestion(user, game.id, '2+2?', ['4'])
    await page.goto(`/${game.id}/admin`)

    await page.getByTestId(`question-item-${question.id}`).click()
    await expect(questionForm(page)).toHaveAttribute('aria-busy', 'false')
    await expect(answerInput(page, 0)).toHaveValue('4')

    await questionForm(page)
      .getByTestId('question-text-input')
      .fill('Two plus two?')
    await questionForm(page)
      .getByTestId('accepted-answer-item-0')
      .getByTestId('remove-answer-button')
      .click()
    await questionForm(page).getByTestId('add-answer-button').click()
    await answerInput(page, 0).fill('four')
    await questionForm(page).getByTestId('save-question-button').click()
    await expect(
      page.getByText('Accepted answers updated successfully'),
    ).toBeVisible()

    await page.reload()
    await page.getByTestId(`question-item-${question.id}`).click()
    await expect(
      questionForm(page).getByTestId('question-text-input'),
    ).toHaveValue('Two plus two?')
    await expect(answerInput(page, 0)).toHaveValue('four')
    await expect(
      questionForm(page).getByTestId('accepted-answer-item-1'),
    ).toHaveCount(0)
  })

  test('a question cannot be saved without text or accepted answers', async ({
    signIn,
    api,
  }) => {
    const { page, user } = await signIn('editor')
    const game = await api.createGame(user)
    const question = await api.createQuestion(user, game.id, '2+2?', ['4'])
    await page.goto(`/${game.id}/admin`)
    await page.getByTestId(`question-item-${question.id}`).click()
    await expect(questionForm(page)).toHaveAttribute('aria-busy', 'false')

    await questionForm(page).getByTestId('question-text-input').clear()
    await answerInput(page, 0).clear()

    await questionForm(page).getByTestId('save-question-button').click()
    await expect(
      questionForm(page).getByText('Question text must present'),
    ).toBeVisible()
    await expect(
      questionForm(page).getByText('Empty answer is not accepted'),
    ).toBeVisible()

    await questionForm(page).getByTestId('question-text-input').fill('2+2?')
    await questionForm(page)
      .getByTestId('accepted-answer-item-0')
      .getByTestId('remove-answer-button')
      .click()
    await questionForm(page).getByTestId('save-question-button').click()
    await expect(
      questionForm(page).getByText(
        'There should be at least one correct answer',
      ),
    ).toBeVisible()
    await expect(page.getByText('Question updated successfully')).toHaveCount(0)
  })

  test('the host deletes a question', async ({ signIn, api }) => {
    const { page, user } = await signIn('editor')
    const game = await api.createGame(user)
    const kept = await api.createQuestion(user, game.id, 'Kept', ['a'])
    const deleted = await api.createQuestion(user, game.id, 'Deleted', ['b'])
    await page.goto(`/${game.id}/admin`)

    await page.getByTestId(`question-item-${deleted.id}`).click()
    await expect(
      page.getByTestId(`question-item-${deleted.id}`),
    ).toHaveAttribute('aria-selected', 'true')
    await page.getByTestId('delete-question-button').click()

    await expect(page.getByText('Question deleted successfully')).toBeVisible()
    await expect(questionForm(page)).toHaveCount(0)
    await expect(questionItems(page)).toHaveCount(1)
    await expect(page.getByTestId(`question-item-${kept.id}`)).toBeVisible()

    await page.reload()
    await expect(questionItems(page)).toHaveCount(1)
  })
})
