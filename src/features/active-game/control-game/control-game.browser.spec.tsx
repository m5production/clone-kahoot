import { describe, expect, it, vi } from 'vitest'
import {
  ActiveGameContext,
  type ActiveGameState,
  createActiveGameState,
  createSessionQuestion,
  createSessionState,
} from '@/entities/active-game'
import { renderWithProviders } from '@/shared/test'
import { HostControls } from './control-game.ui.host-controls'
import { QuestionProgress } from './control-game.ui.question-progress'

const renderInGame = (state: ActiveGameState, ui: React.ReactNode) =>
  renderWithProviders(
    <ActiveGameContext.Provider value={state}>{ui}</ActiveGameContext.Provider>,
  )

describe('QuestionProgress', () => {
  it('shows the current question number and the total', async () => {
    const screen = await renderInGame(
      createActiveGameState({
        session: createSessionState({
          question: createSessionQuestion({
            id: 'q2',
            text: 'x',
            number: 2,
            total: 3,
          }),
        }),
      }),
      <QuestionProgress />,
    )

    await expect
      .element(screen.getByTestId('question-progress-text'))
      .toHaveTextContent('Question 2 of 3')
  })

  it('shows the lobby while no question is open', async () => {
    const screen = await renderInGame(
      createActiveGameState({
        session: createSessionState({ state: 'lobby', question: null }),
      }),
      <QuestionProgress />,
    )

    await expect
      .element(screen.getByTestId('question-progress-text'))
      .toHaveTextContent('Lobby')
  })
})

describe('HostControls', () => {
  const renderControls = async (state: Partial<ActiveGameState> = {}) => {
    const sendMessage = vi.fn()
    const screen = await renderInGame(
      createActiveGameState({ sendMessage, ...state }),
      <HostControls />,
    )

    return { screen, sendMessage }
  }

  it('starts the game from the lobby', async () => {
    const { screen, sendMessage } = await renderControls({
      session: createSessionState({ state: 'lobby', question: null }),
    })

    await screen.getByTestId('start-game-button').click()

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'START_GAME',
      payload: null,
    })
  })

  it('closes an open question', async () => {
    const { screen, sendMessage } = await renderControls({
      session: createSessionState({ state: 'question_open' }),
    })

    await screen.getByTestId('close-question-button').click()

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'CLOSE_QUESTION',
      payload: null,
    })
  })

  it('shows the answers of a closed question', async () => {
    const { screen, sendMessage } = await renderControls({
      session: createSessionState({ state: 'question_closed' }),
    })

    await screen.getByTestId('show-answers-button').click()

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SHOW_ANSWERS',
      payload: null,
    })
  })

  it('moves to the next question after the answers', async () => {
    const { screen, sendMessage } = await renderControls({
      session: createSessionState({
        state: 'answers_shown',
        question: createSessionQuestion({
          id: 'q1',
          text: 'x',
          number: 1,
          total: 2,
        }),
      }),
    })

    await screen.getByTestId('next-question-button').click()

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'NEXT_QUESTION',
      payload: null,
    })
  })

  it('offers the winners instead of a next question on the last one', async () => {
    const { screen, sendMessage } = await renderControls({
      session: createSessionState({
        state: 'answers_shown',
        question: createSessionQuestion({
          id: 'q2',
          text: 'x',
          number: 2,
          total: 2,
        }),
      }),
    })

    await screen.getByTestId('show-winners-button').click()

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SHOW_WINNERS',
      payload: null,
    })
  })

  it('ends the session after a confirmation click', async () => {
    const { screen, sendMessage } = await renderControls()

    const button = screen.getByTestId('end-session-button')
    await button.click()
    expect(sendMessage).not.toHaveBeenCalled()

    await expect.element(button).toHaveTextContent('Confirm: end the session?')
    await button.click()

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'END_SESSION',
      payload: null,
    })
  })

  it('shows the home link once the session ended', async () => {
    const { screen } = await renderControls({ endReason: 'finished' })

    await screen.getByTestId('home-link').click()
    await expect
      .element(screen.getByTestId('test-location'))
      .toHaveTextContent('/home')
  })
})
