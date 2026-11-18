import { describe, expect, it, vi } from 'vitest'
import { toast } from 'react-toastify'
import { queryClient } from '@/shared/api'
import { renderWithProviders } from '@/shared/test'
import {
  ACCEPTED_ANSWERS_QUERY,
  replaceAcceptedAnswers,
  type AcceptedAnswer,
} from '@/entities/accepted-answer'
import { QUESTION_QUERY, updateQuestion, type Question } from '@/entities/question'
import { EditQuestionForm } from './edit-question.ui'

vi.mock('react-toastify', () => ({ toast: { success: vi.fn() } }))
vi.mock('@/entities/question', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/question')>()),
  updateQuestion: vi.fn(),
}))
vi.mock('@/entities/accepted-answer', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/accepted-answer')>()),
  replaceAcceptedAnswers: vi.fn(),
}))

const question: Question = { id: 'q1', gameId: 'g1', text: '2+2?', img: null }

const renderForm = async (answers: AcceptedAnswer[]) => {
  queryClient.setQueryData(QUESTION_QUERY.queryKey('q1'), question)
  queryClient.setQueryData(ACCEPTED_ANSWERS_QUERY.queryKey('q1'), answers)

  const screen = await renderWithProviders(
    <EditQuestionForm gameId="g1" questionId="q1" questionNumber={3} />
  )
  const form = screen.getByTestId('question-form')

  await expect.element(form.getByTestId('question-text-input')).toHaveValue('2+2?')

  return form
}

const answerInput = (form: Awaited<ReturnType<typeof renderForm>>, index: number) =>
  form.getByTestId(`accepted-answer-item-${index}`).getByTestId('accepted-answer-input')

describe('EditQuestionForm', () => {
  it('shows the question with its accepted answers', async () => {
    const form = await renderForm([{ id: 'a1', questionId: 'q1', text: '4' }])

    await expect.element(form.getByRole('heading', { name: 'Question #3' })).toBeVisible()
    await expect.element(answerInput(form, 0)).toHaveValue('4')
  })

  it('saves the question and replaces its accepted answers', async () => {
    vi.mocked(updateQuestion).mockResolvedValue({ ...question, text: 'Two plus two?' })
    vi.mocked(replaceAcceptedAnswers).mockResolvedValue([])
    const form = await renderForm([{ id: 'a1', questionId: 'q1', text: '4' }])

    await form.getByTestId('question-text-input').fill('Two plus two?')
    await form.getByTestId('add-answer-button').click()
    await answerInput(form, 1).fill('four')
    await form.getByTestId('save-question-button').click()

    await expect.poll(() => vi.mocked(toast.success).mock.calls.length).toBe(2)
    expect(updateQuestion).toHaveBeenCalledWith(
      { id: 'q1', gameId: 'g1', text: 'Two plus two?', img: null },
      expect.anything()
    )
    expect(replaceAcceptedAnswers).toHaveBeenCalledWith('q1', [
      { text: '4', questionId: 'q1' },
      { text: 'four', questionId: 'q1' },
    ])
  })

  it('requires at least one accepted answer', async () => {
    const form = await renderForm([])

    await form.getByTestId('save-question-button').click()

    await expect
      .element(form.getByText('There should be at least one correct answer'))
      .toBeVisible()
    expect(updateQuestion).not.toHaveBeenCalled()
  })

  it('rejects an empty question text and an empty answer', async () => {
    const form = await renderForm([{ id: 'a1', questionId: 'q1', text: '4' }])

    await form.getByTestId('question-text-input').clear()
    await answerInput(form, 0).clear()
    await form.getByTestId('save-question-button').click()

    await expect.element(form.getByText('Question text must present')).toBeVisible()
    await expect.element(form.getByText('Empty answer is not accepted')).toBeVisible()
    expect(updateQuestion).not.toHaveBeenCalled()
  })

  it('removes an accepted answer', async () => {
    const form = await renderForm([
      { id: 'a1', questionId: 'q1', text: '4' },
      { id: 'a2', questionId: 'q1', text: 'four' },
    ])

    await form.getByTestId('accepted-answer-item-0').getByTestId('remove-answer-button').click()

    await expect.element(answerInput(form, 0)).toHaveValue('four')
    await expect.element(form.getByTestId('accepted-answer-item-1')).not.toBeInTheDocument()
  })

  it('previews the image url', async () => {
    const form = await renderForm([])

    await form.getByTestId('question-image-input').fill('http://127.0.0.1:9/pic.png')

    await expect.element(form.getByText('Image is loading...')).toBeVisible()
  })
})
