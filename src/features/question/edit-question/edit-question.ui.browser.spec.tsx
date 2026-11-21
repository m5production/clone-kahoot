import { toast } from 'react-toastify'
import { describe, expect, it, vi } from 'vitest'
import {
  ACCEPTED_ANSWERS_QUERY,
  type AcceptedAnswer,
  replaceAcceptedAnswers,
} from '@/entities/accepted-answer'
import {
  ANSWER_OPTIONS_QUERY,
  type AnswerOption,
  replaceAnswerOptions,
} from '@/entities/answer-option'
import {
  QUESTION_QUERY,
  type Question,
  updateQuestion,
} from '@/entities/question'
import { queryClient } from '@/shared/api'
import { renderWithProviders } from '@/shared/test'
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
vi.mock('@/entities/answer-option', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/answer-option')>()),
  replaceAnswerOptions: vi.fn(),
}))

const question: Question = {
  id: 'q1',
  gameId: 'g1',
  order: 1,
  text: '2+2?',
  img: null,
  timeLimitSec: 30,
  type: 'open',
  answersCount: 1,
  optionsCount: 0,
}

const renderForm = async (
  answers: AcceptedAnswer[],
  overrides: {
    question?: Partial<Question>
    options?: AnswerOption[]
  } = {},
) => {
  queryClient.setQueryData(QUESTION_QUERY.queryKey('q1'), {
    ...question,
    ...overrides.question,
  })
  queryClient.setQueryData(ACCEPTED_ANSWERS_QUERY.queryKey('q1'), answers)
  queryClient.setQueryData(
    ANSWER_OPTIONS_QUERY.queryKey('q1'),
    overrides.options ?? [],
  )

  const screen = await renderWithProviders(
    <EditQuestionForm questionId="q1" questionNumber={3} />,
  )
  const form = screen.getByTestId('question-form')

  await expect.element(form).toHaveAttribute('aria-busy', 'false')
  await expect
    .element(form.getByTestId('question-text-input'))
    .toHaveValue('2+2?')

  return form
}

const answerInput = (
  form: Awaited<ReturnType<typeof renderForm>>,
  index: number,
) =>
  form
    .getByTestId(`accepted-answer-item-${index}`)
    .getByTestId('accepted-answer-input')

describe('EditQuestionForm', () => {
  it('shows the question with its accepted answers', async () => {
    const form = await renderForm([{ id: 'a1', questionId: 'q1', text: '4' }])

    await expect
      .element(form.getByRole('heading', { name: 'Question #3' }))
      .toBeVisible()
    await expect.element(answerInput(form, 0)).toHaveValue('4')
  })

  it('saves the question and replaces its accepted answers', async () => {
    vi.mocked(updateQuestion).mockResolvedValue({
      ...question,
      text: 'Two plus two?',
    })
    vi.mocked(replaceAcceptedAnswers).mockResolvedValue([])
    const form = await renderForm([{ id: 'a1', questionId: 'q1', text: '4' }])

    await form.getByTestId('question-text-input').fill('Two plus two?')
    // FR-53: the editor stores the chosen time limit
    await expect
      .element(form.getByTestId('question-time-limit-select'))
      .toHaveValue('30')
    await form.getByTestId('question-time-limit-select').selectOptions('60')
    await form.getByTestId('add-answer-button').click()
    await answerInput(form, 1).fill('four')
    await form.getByTestId('save-question-button').click()

    await expect.poll(() => vi.mocked(toast.success).mock.calls.length).toBe(1)
    expect(updateQuestion).toHaveBeenCalledWith({
      id: 'q1',
      text: 'Two plus two?',
      img: null,
      timeLimitSec: 60,
      type: 'open',
    })
    expect(replaceAcceptedAnswers).toHaveBeenCalledWith('q1', [
      { text: '4', questionId: 'q1' },
      { text: 'four', questionId: 'q1' },
    ])
  })

  it('offers one empty answer field for a question without accepted answers', async () => {
    vi.mocked(updateQuestion).mockResolvedValue(question)
    vi.mocked(replaceAcceptedAnswers).mockResolvedValue([])
    const form = await renderForm([])

    await expect.element(answerInput(form, 0)).toHaveValue('')
    await expect
      .element(form.getByTestId('accepted-answer-item-1'))
      .not.toBeInTheDocument()

    await answerInput(form, 0).fill('4')
    await form.getByTestId('save-question-button').click()

    await expect
      .poll(() => vi.mocked(replaceAcceptedAnswers).mock.calls)
      .toEqual([['q1', [{ text: '4', questionId: 'q1' }]]])
  })

  it('requires at least one accepted answer', async () => {
    const form = await renderForm([])

    await form
      .getByTestId('accepted-answer-item-0')
      .getByTestId('remove-answer-button')
      .click()
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

    await expect
      .element(form.getByText('Question text must present'))
      .toBeVisible()
    await expect
      .element(form.getByText('Empty answer is not accepted'))
      .toBeVisible()
    expect(updateQuestion).not.toHaveBeenCalled()
  })

  it('removes an accepted answer', async () => {
    const form = await renderForm([
      { id: 'a1', questionId: 'q1', text: '4' },
      { id: 'a2', questionId: 'q1', text: 'four' },
    ])

    await form
      .getByTestId('accepted-answer-item-0')
      .getByTestId('remove-answer-button')
      .click()

    await expect.element(answerInput(form, 0)).toHaveValue('four')
    await expect
      .element(form.getByTestId('accepted-answer-item-1'))
      .not.toBeInTheDocument()
  })

  it('previews the image url', async () => {
    const form = await renderForm([])

    await form
      .getByTestId('question-image-input')
      .fill('http://127.0.0.1:9/pic.png')

    await expect.element(form.getByRole('status')).toBeVisible()
  })

  it('shows a choice question with its options and the correct mark (FR-99)', async () => {
    const form = await renderForm([], {
      question: { type: 'choice', optionsCount: 3, answersCount: 0 },
      options: [
        { id: 'o1', questionId: 'q1', order: 0, text: '3', isCorrect: false },
        { id: 'o2', questionId: 'q1', order: 1, text: '4', isCorrect: true },
        { id: 'o3', questionId: 'q1', order: 2, text: '5', isCorrect: false },
      ],
    })

    await expect.element(form.getByTestId('answer-options-list')).toBeVisible()
    await expect
      .element(form.getByTestId('accepted-answers-list'))
      .not.toBeInTheDocument()
    await expect
      .element(
        form
          .getByTestId('answer-option-item-1')
          .getByTestId('answer-option-input'),
      )
      .toHaveValue('4')
    await expect
      .element(
        form
          .getByTestId('answer-option-item-1')
          .getByTestId('correct-option-input'),
      )
      .toBeChecked()
  })

  it('saves a choice question by replacing its options (FR-99)', async () => {
    vi.mocked(updateQuestion).mockResolvedValue({
      ...question,
      type: 'choice',
      optionsCount: 2,
      answersCount: 0,
    })
    vi.mocked(replaceAnswerOptions).mockResolvedValue([])
    const form = await renderForm([], {
      question: { type: 'choice', optionsCount: 2, answersCount: 0 },
      options: [
        { id: 'o1', questionId: 'q1', order: 0, text: '3', isCorrect: true },
        { id: 'o2', questionId: 'q1', order: 1, text: '4', isCorrect: false },
      ],
    })

    // mark the second option as correct, then save
    await form
      .getByTestId('answer-option-item-1')
      .getByTestId('correct-option-input')
      .click()
    await form.getByTestId('save-question-button').click()

    await expect.poll(() => vi.mocked(toast.success).mock.calls.length).toBe(1)
    expect(updateQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'q1', type: 'choice' }),
    )
    expect(replaceAnswerOptions).toHaveBeenCalledWith('q1', [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: true },
    ])
    expect(replaceAcceptedAnswers).not.toHaveBeenCalled()
  })

  it('flags duplicated options on save (FR-100, BR-86)', async () => {
    const form = await renderForm([], {
      question: { type: 'choice', optionsCount: 2, answersCount: 0 },
      options: [
        { id: 'o1', questionId: 'q1', order: 0, text: '3', isCorrect: true },
        { id: 'o2', questionId: 'q1', order: 1, text: '4', isCorrect: false },
      ],
    })

    await form
      .getByTestId('answer-option-item-1')
      .getByTestId('answer-option-input')
      .fill(' 3 ')
    await form.getByTestId('save-question-button').click()

    await expect
      .element(form.getByText('This option duplicates another one'))
      .toBeVisible()
    expect(updateQuestion).not.toHaveBeenCalled()
  })

  it('keeps the option count within 2-4 (FR-99, BR-86)', async () => {
    const form = await renderForm([], {
      question: { type: 'choice', optionsCount: 2, answersCount: 0 },
      options: [
        { id: 'o1', questionId: 'q1', order: 0, text: 'a', isCorrect: true },
        { id: 'o2', questionId: 'q1', order: 1, text: 'b', isCorrect: false },
      ],
    })

    // at two options the remove buttons are disabled, at four — the add button
    for (const index of [0, 1]) {
      await expect
        .element(
          form
            .getByTestId(`answer-option-item-${index}`)
            .getByTestId('remove-option-button'),
        )
        .toBeDisabled()
    }
    await form.getByTestId('add-option-button').click()
    await form.getByTestId('add-option-button').click()
    await expect.element(form.getByTestId('add-option-button')).toBeDisabled()
    await expect
      .element(
        form
          .getByTestId('answer-option-item-3')
          .getByTestId('remove-option-button'),
      )
      .not.toBeDisabled()
  })

  it('asks to confirm a type switch when the other set has data (D-12)', async () => {
    const form = await renderForm([{ id: 'a1', questionId: 'q1', text: '4' }])

    await form.getByTestId('choice-tab').click()
    await expect.element(form.getByTestId('type-switch-confirm')).toBeVisible()

    // cancelling keeps the open form
    await form.getByTestId('cancel-type-switch-button').click()
    await expect
      .element(form.getByTestId('accepted-answers-list'))
      .toBeVisible()

    // confirming swaps the answers list for the options editor
    await form.getByTestId('choice-tab').click()
    await form.getByTestId('confirm-type-switch-button').click()
    await expect.element(form.getByTestId('answer-options-list')).toBeVisible()
    await expect
      .element(form.getByTestId('accepted-answers-list'))
      .not.toBeInTheDocument()
  })

  it('switches the type without a confirm when the other set is empty (D-12)', async () => {
    const form = await renderForm([])

    // a new question has only the empty placeholder answer — the switch is direct
    await form.getByTestId('choice-tab').click()

    await expect
      .element(form.getByTestId('type-switch-confirm'))
      .not.toBeInTheDocument()
    await expect.element(form.getByTestId('answer-options-list')).toBeVisible()
  })
})
