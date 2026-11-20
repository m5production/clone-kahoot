import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { WinnersTable } from './player.ui.winners-table'

describe('WinnersTable', () => {
  it('shows place, score and the correct count from the server standings', async () => {
    const screen = await render(
      <WinnersTable
        winners={[
          { place: 1, id: 'b', name: 'Bob', score: 1950, correctCount: 2 },
          { place: 2, id: 'c', name: 'Cid', score: 800, correctCount: 1 },
          { place: 3, id: 'a', name: 'Ann', score: 0, correctCount: 0 },
        ]}
      />,
    )

    const row = screen.getByTestId('winner-row-b')
    await expect.element(row.getByText('1. Bob')).toBeVisible()
    await expect.element(row.getByText('1950')).toBeVisible()
    await expect.element(row.getByText('2 correct')).toBeVisible()

    await expect
      .element(screen.getByTestId('winner-row-c').getByText('2. Cid'))
      .toBeVisible()
    await expect
      .element(screen.getByTestId('winner-row-a').getByText('3. Ann'))
      .toBeVisible()
  })

  it('renders a shared place without renumbering the rows (BR-73)', async () => {
    const screen = await render(
      <WinnersTable
        winners={[
          { place: 1, id: 'a', name: 'Ann', score: 1000, correctCount: 1 },
          { place: 1, id: 'b', name: 'Bob', score: 1000, correctCount: 1 },
          { place: 3, id: 'c', name: 'Cid', score: 500, correctCount: 1 },
        ]}
      />,
    )

    await expect
      .element(screen.getByTestId('winner-row-a').getByText('1. Ann'))
      .toBeVisible()
    await expect
      .element(screen.getByTestId('winner-row-b').getByText('1. Bob'))
      .toBeVisible()
    await expect
      .element(screen.getByTestId('winner-row-c').getByText('3. Cid'))
      .toBeVisible()
  })

  it('renders an empty table without players', async () => {
    const screen = await render(<WinnersTable winners={[]} />)

    expect(screen.getByRole('listitem').elements()).toHaveLength(0)
  })
})
