import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import {
  ActiveGameContext,
  type ActiveGameState,
  createActiveGameState,
  createSessionPlayer,
  createSessionQuestion,
  createSessionState,
} from '@/entities/active-game'
import { saveSessionUserId } from '@/entities/session'
import { SubmitAnswerForm } from './submit-answer.ui'

const renderForm = (state: ActiveGameState) =>
  render(
    <ActiveGameContext.Provider value={state}>
      <SubmitAnswerForm />
    </ActiveGameContext.Provider>,
  )

describe('SubmitAnswerForm', () => {
  it('sends the answer to the open question for the current player', async () => {
    saveSessionUserId('u1')
    const sendMessage = vi.fn()
    const screen = await renderForm(createActiveGameState({ sendMessage }))

    await screen.getByTestId('answer-input').fill('4')
    await screen.getByTestId('submit-answer-button').click()

    await expect.poll(() => sendMessage.mock.calls.length).toBe(1)
    expect(sendMessage).toHaveBeenCalledWith({
      type: 'ANSWER_QUESTION',
      payload: { questionId: 'q1', answer: '4' },
    })
    await expect.element(screen.getByTestId('answer-input')).toHaveValue('4')
  })

  it('does not send an empty answer', async () => {
    const sendMessage = vi.fn()
    const screen = await renderForm(createActiveGameState({ sendMessage }))

    await screen.getByTestId('submit-answer-button').click()

    await expect
      .element(screen.getByText("You can't submit empty answer"))
      .toBeVisible()
    await expect
      .element(screen.getByTestId('answer-input'))
      .toHaveAttribute('aria-invalid', 'true')
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('locks the form once the player has answered the question', async () => {
    saveSessionUserId('u1')
    const screen = await renderForm(
      createActiveGameState({
        session: createSessionState({
          players: [createSessionPlayer({ id: 'u1', answered: true })],
        }),
      }),
    )

    await expect.element(screen.getByTestId('answer-input')).toBeDisabled()
    await expect
      .element(screen.getByTestId('submit-answer-button'))
      .toBeDisabled()
  })

  it('locks the form while no question is open', async () => {
    const screen = await renderForm(
      createActiveGameState({
        session: createSessionState({ state: 'question_closed' }),
      }),
    )

    await expect.element(screen.getByTestId('answer-input')).toBeDisabled()
    await expect
      .element(screen.getByTestId('submit-answer-button'))
      .toBeDisabled()
  })

  it('locks the form when the question time is up', async () => {
    const screen = await renderForm(
      createActiveGameState({
        session: createSessionState({
          question: createSessionQuestion({ endsAt: Date.now() - 1000 }),
        }),
      }),
    )

    await expect.element(screen.getByTestId('answer-input')).toBeDisabled()
    await expect
      .element(screen.getByTestId('submit-answer-button'))
      .toBeDisabled()
    await expect.element(screen.getByText(/Time is up/)).toBeVisible()
  })

  const choiceQuestion = () =>
    createSessionQuestion({
      type: 'choice',
      options: [
        { id: 'o1', text: '3' },
        { id: 'o2', text: '4' },
        { id: 'o3', text: '5' },
        { id: 'o4', text: '6' },
      ],
    })

  it('sends the picked option of a choice question (US-36)', async () => {
    saveSessionUserId('u1')
    const sendMessage = vi.fn()
    const screen = await renderForm(
      createActiveGameState({
        sendMessage,
        session: createSessionState({ question: choiceQuestion() }),
      }),
    )

    // the text answer form is not offered for a choice question
    await expect
      .element(screen.getByTestId('answer-input'))
      .not.toBeInTheDocument()
    await screen.getByTestId('answer-option-1').click()

    await expect.poll(() => sendMessage.mock.calls.length).toBe(1)
    expect(sendMessage).toHaveBeenCalledWith({
      type: 'ANSWER_QUESTION',
      payload: { questionId: 'q1', optionId: 'o2' },
    })
  })

  it('locks the option buttons once a pick is made (BR-87)', async () => {
    saveSessionUserId('u1')
    const sendMessage = vi.fn()
    const screen = await renderForm(
      createActiveGameState({
        sendMessage,
        session: createSessionState({ question: choiceQuestion() }),
      }),
    )

    await screen.getByTestId('answer-option-0').click()

    for (const index of [0, 1, 2, 3]) {
      await expect
        .element(screen.getByTestId(`answer-option-${index}`))
        .toBeDisabled()
    }
    // a second pick is not sent
    await screen.getByTestId('answer-option-2').click({ force: true })
    expect(sendMessage).toHaveBeenCalledTimes(1)
    await expect
      .element(screen.getByText('Your answer has been accepted.'))
      .toBeVisible()
  })

  it('locks the option buttons when the player already answered (BR-87)', async () => {
    saveSessionUserId('u1')
    const screen = await renderForm(
      createActiveGameState({
        session: createSessionState({
          question: choiceQuestion(),
          players: [createSessionPlayer({ id: 'u1', answered: true })],
        }),
        myAnswer: { questionId: 'q1', text: '4', optionId: 'o2' },
      }),
    )

    for (const index of [0, 1, 2, 3]) {
      await expect
        .element(screen.getByTestId(`answer-option-${index}`))
        .toBeDisabled()
    }
    await expect
      .element(screen.getByTestId('answer-option-1'))
      .toHaveAttribute('aria-pressed', 'true')
  })
})
