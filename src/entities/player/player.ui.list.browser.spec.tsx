import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { createAnswer, createPlayer } from './player.fixtures'
import { Players } from './player.ui.list'

const players = [
  createPlayer({ id: 'a', name: 'Ann', answers: [createAnswer('q1')] }),
  createPlayer({ id: 'b', name: 'Bob' }),
]

describe('Players', () => {
  it('lists the connected players with their count', async () => {
    const screen = await render(
      <Players players={players} activeQuestionId="q1" playerAnswers={null} />,
    )

    await expect
      .element(screen.getByRole('heading', { name: 'Players (2)' }))
      .toBeVisible()
    await expect
      .element(screen.getByTestId('player-item-a'))
      .toHaveTextContent('Ann')
    await expect
      .element(screen.getByTestId('player-item-b'))
      .toHaveTextContent('Bob')
  })

  it('shows every player answer once the answers are revealed', async () => {
    const screen = await render(
      <Players
        players={players}
        activeQuestionId="q1"
        playerAnswers={[
          {
            playerId: 'a',
            playerName: 'Ann',
            playerAnswer: { questionId: 'q1', text: '4', isCorrect: true },
          },
          {
            playerId: 'b',
            playerName: 'Bob',
            playerAnswer: { questionId: 'q1', text: null, isCorrect: false },
          },
        ]}
      />,
    )

    await expect
      .element(screen.getByTestId('player-answer-item-a'))
      .toHaveTextContent('Ann: 4')
    await expect
      .element(screen.getByTestId('player-answer-item-b'))
      .toHaveTextContent('Bob: No answer')
    await expect
      .element(screen.getByTestId('players-list'))
      .not.toBeInTheDocument()
  })

  it('keeps the players list while no question is active', async () => {
    const screen = await render(
      <Players players={players} playerAnswers={[]} />,
    )

    await expect.element(screen.getByTestId('players-list')).toBeVisible()
  })
})
