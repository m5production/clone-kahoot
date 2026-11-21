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
})
