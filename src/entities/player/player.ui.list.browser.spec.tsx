import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { createPlayer } from './player.fixtures'
import { Players } from './player.ui.list'

const players = [
  createPlayer({ id: 'a', name: 'Ann', answered: true }),
  createPlayer({ id: 'b', name: 'Bob' }),
]

describe('Players', () => {
  it('lists the players with their count', async () => {
    const screen = await render(
      <Players players={players} showAnswered playerAnswers={null} />,
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
        playerAnswers={[
          {
            playerId: 'a',
            playerName: 'Ann',
            text: '4',
            isCorrect: true,
            points: 950,
          },
          {
            playerId: 'b',
            playerName: 'Bob',
            text: null,
            isCorrect: false,
            points: 0,
          },
        ]}
      />,
    )

    await expect
      .element(screen.getByTestId('player-answer-item-a'))
      .toHaveTextContent('Ann: 4 +950')
    await expect
      .element(screen.getByTestId('player-answer-item-b'))
      .toHaveTextContent('Bob: No answer +0')
    await expect
      .element(screen.getByTestId('players-list'))
      .not.toBeInTheDocument()
  })

  it('keeps the players list while answers are not revealed', async () => {
    const screen = await render(
      <Players players={players} playerAnswers={null} />,
    )

    await expect.element(screen.getByTestId('players-list')).toBeVisible()
  })
})
