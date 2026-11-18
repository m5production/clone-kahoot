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
    const game = await api.createGame(user.id)
    await page.goto(`/${game.id}/admin`)

    await page.getByTestId('add-question-button').click()

    const form = questionForm(page)
    await expect(form.getByRole('heading', { name: 'Question #1' })).toBeVisible()
    // A new question has no accepted answers yet; wait until the form has loaded it
    await expect(form.getByTestId('accepted-answers-list').getByRole('listitem')).toHaveCount(0)
    await expect(questionItems(page)).toHaveCount(1)

    await form.getByTestId('question-image-input').fill(PIXEL)
    await form.getByTestId('question-text-input').fill('Capital of France?')
    await form.getByTestId('add-answer-button').click()
    await answerInput(page, 0).fill('Paris')
    await form.getByTestId('add-answer-button').click()
    await answerInput(page, 1).fill('paris')
    await form.getByTestId('save-question-button').click()

    await expect(page.getByText('Question updated successfully')).toBeVisible()
    await expect(page.getByText('Accepted answers updated successfully')).toBeVisible()

    await page.reload()
    await questionItems(page).first().click()

    await expect(form.getByTestId('question-text-input')).toHaveValue('Capital of France?')
    await expect(form.getByTestId('question-image-input')).toHaveValue(PIXEL)
    await expect(form.getByRole('img', { name: 'Question illustration' })).toBeVisible()
    await expect(answerInput(page, 0)).toHaveValue('Paris')
    await expect(answerInput(page, 1)).toHaveValue('paris')
  })

  test('the host edits a question', async ({ signIn, api }) => {
    const { page, user } = await signIn('editor')
    const game = await api.createGame(user.id)
    const question = await api.createQuestion(game.id, '2+2?', ['4'])
    await page.goto(`/${game.id}/admin`)

    await page.getByTestId(`question-item-${question.id}`).click()
    await expect(answerInput(page, 0)).toHaveValue('4')

    await questionForm(page).getByTestId('question-text-input').fill('Two plus two?')
    await questionForm(page)
      .getByTestId('accepted-answer-item-0')
      .getByTestId('remove-answer-button')
      .click()
    await questionForm(page).getByTestId('add-answer-button').click()
    await answerInput(page, 0).fill('four')
    await questionForm(page).getByTestId('save-question-button').click()
    await expect(page.getByText('Accepted answers updated successfully')).toBeVisible()

    await page.reload()
    await page.getByTestId(`question-item-${question.id}`).click()
    await expect(questionForm(page).getByTestId('question-text-input')).toHaveValue(
      'Two plus two?'
    )
    await expect(answerInput(page, 0)).toHaveValue('four')
    await expect(questionForm(page).getByTestId('accepted-answer-item-1')).toHaveCount(0)
  })

  test('a question cannot be saved without text or accepted answers', async ({
    signIn,
    api,
  }) => {
    const { page, user } = await signIn('editor')
    const game = await api.createGame(user.id)
    const question = await api.createQuestion(game.id, '', [])
    await page.goto(`/${game.id}/admin`)
    await page.getByTestId(`question-item-${question.id}`).click()
    // The empty form starts with one answer field; none means the question has loaded
    await expect(
      questionForm(page).getByTestId('accepted-answers-list').getByRole('listitem')
    ).toHaveCount(0)

    await questionForm(page).getByTestId('save-question-button').click()
    await expect(questionForm(page).getByText('Question text must present')).toBeVisible()

    await questionForm(page).getByTestId('question-text-input').fill('2+2?')
    await questionForm(page).getByTestId('save-question-button').click()
    await expect(
      questionForm(page).getByText('There should be at least one correct answer')
    ).toBeVisible()
    await expect(page.getByText('Question updated successfully')).toHaveCount(0)
  })

  test('the host deletes a question', async ({ signIn, api }) => {
    const { page, user } = await signIn('editor')
    const game = await api.createGame(user.id)
    const kept = await api.createQuestion(game.id, 'Kept', ['a'])
    const deleted = await api.createQuestion(game.id, 'Deleted', ['b'])
    await page.goto(`/${game.id}/admin`)

    await page.getByTestId(`question-item-${deleted.id}`).click()
    await expect(page.getByTestId(`question-item-${deleted.id}`)).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await page.getByTestId('delete-question-button').click()

    await expect(page.getByText('Question deleted successfully')).toBeVisible()
    await expect(questionForm(page)).toHaveCount(0)
    await expect(questionItems(page)).toHaveCount(1)
    await expect(page.getByTestId(`question-item-${kept.id}`)).toBeVisible()

    await page.reload()
    await expect(questionItems(page)).toHaveCount(1)
  })
})
