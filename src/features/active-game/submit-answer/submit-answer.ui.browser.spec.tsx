import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import {
  ActiveGameContext,
  createActiveGameState,
  type ActiveGameState,
} from '@/entities/active-game'
import { saveSessionUserId } from '@/entities/session'
import { SubmitAnswerForm } from './submit-answer.ui'

const renderForm = (state: ActiveGameState) =>
  render(
    <ActiveGameContext.Provider value={state}>
      <SubmitAnswerForm />
    </ActiveGameContext.Provider>
  )

describe('SubmitAnswerForm', () => {
  it('sends the answer to the active question for the current player', async () => {
    saveSessionUserId('u1')
    const sendMessage = vi.fn()
    const screen = await renderForm(createActiveGameState({ sendMessage }))

    await screen.getByTestId('answer-input').fill('4')
    await screen.getByTestId('submit-answer-button').click()

    await expect.poll(() => sendMessage.mock.calls.length).toBe(1)
    expect(sendMessage).toHaveBeenCalledWith({
      type: 'ANSWER_QUESTION',
      payload: { questionId: 'q1', answer: '4', playerId: 'u1' },
    })
    await expect.element(screen.getByTestId('answer-input')).toHaveValue('')
  })

  it('does not send an empty answer', async () => {
    const sendMessage = vi.fn()
    const screen = await renderForm(createActiveGameState({ sendMessage }))

    await screen.getByTestId('submit-answer-button').click()

    await expect
      .element(screen.getByText(/It is not allowed to submit empty answer/))
      .toBeVisible()
    await expect.element(screen.getByTestId('answer-input')).toHaveAttribute('aria-invalid', 'true')
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('locks the form once the player has answered the question', async () => {
    saveSessionUserId('u1')
    const screen = await renderForm(
      createActiveGameState({
        players: [
          {
            id: 'u1',
            name: 'alice',
            bgColor: '#000',
            answers: [{ questionId: 'q1', text: '4', isCorrect: true }],
          },
        ],
      })
    )

    await expect.element(screen.getByTestId('answer-input')).toHaveValue('4')
    await expect.element(screen.getByTestId('answer-input')).toBeDisabled()
    await expect.element(screen.getByTestId('submit-answer-button')).toBeDisabled()
  })
})
