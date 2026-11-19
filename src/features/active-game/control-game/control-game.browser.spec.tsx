import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/shared/test'
import {
  ActiveGameContext,
  createActiveGameState,
  type ActiveGameState,
} from '@/entities/active-game'
import { HostControls } from './control-game.ui.host-controls'
import { QuestionSwitcher } from './control-game.ui.question-switcher'

const renderInGame = (state: ActiveGameState, ui: React.ReactNode) =>
  renderWithProviders(
    <ActiveGameContext.Provider value={state}>{ui}</ActiveGameContext.Provider>
  )

describe('QuestionSwitcher', () => {
  it('marks the active question and switches to another one', async () => {
    const sendMessage = vi.fn()
    const screen = await renderInGame(
      createActiveGameState({ sendMessage }),
      <QuestionSwitcher />
    )

    const first = screen.getByTestId('host-question-item-q1').getByTestId('switch-question-button')
    const second = screen.getByTestId('host-question-item-q2').getByTestId('switch-question-button')

    await expect.element(first).toHaveAttribute('aria-current', 'true')
    await expect.element(second).toHaveTextContent('Question 2')

    await second.click()

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'CHANGE_QUESTION',
      payload: { questionId: 'q2' },
    })
  })
})

describe('HostControls', () => {
  const renderControls = async (isWinnersShown = false) => {
    const sendMessage = vi.fn()
    const onWinnersShown = vi.fn()
    const screen = await renderInGame(
      createActiveGameState({ sendMessage }),
      <HostControls
        gameId="g1"
        isWinnersShown={isWinnersShown}
        onWinnersShown={onWinnersShown}
      />
    )

    return { screen, sendMessage, onWinnersShown }
  }

  it('reveals the answers to the active question', async () => {
    const { screen, sendMessage } = await renderControls()

    await screen.getByTestId('show-answers-button').click()

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SHOW_ANSWERS',
      payload: { questionId: 'q1' },
    })
  })

  it('ends the quiz with the winners', async () => {
    const { screen, sendMessage, onWinnersShown } = await renderControls()

    await expect.element(screen.getByTestId('stop-game-button')).toBeDisabled()
    await screen.getByTestId('show-winners-button').click()

    expect(sendMessage).toHaveBeenCalledWith({ type: 'SHOW_WINNERS', payload: null })
    expect(onWinnersShown).toHaveBeenCalledOnce()
  })

  it('lets the host stop the game and go home after the winners', async () => {
    const { screen, sendMessage } = await renderControls(true)

    await expect.element(screen.getByTestId('show-winners-button')).toBeDisabled()
    await screen.getByTestId('stop-game-button').click()

    expect(sendMessage).toHaveBeenCalledWith({ type: 'END_GAME', payload: null })

    await screen.getByTestId('home-link').click()
    await expect.element(screen.getByTestId('test-location')).toHaveTextContent('/home')
  })
})
