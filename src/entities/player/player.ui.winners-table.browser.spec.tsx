import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { WinnersTable } from './player.ui.winners-table'

describe('WinnersTable', () => {
  it('lists players in the order given by the server standings', async () => {
    const screen = await render(
      <WinnersTable
        winners={[
          { id: 'b', name: 'Bob', score: 2 },
          { id: 'c', name: 'Cid', score: 1 },
          { id: 'a', name: 'Ann', score: 0 },
        ]}
      />,
    )

    const rows = screen.getByTestId('winners-table').getByRole('listitem')

    await expect.element(rows.nth(0)).toHaveTextContent('1. Bob: 2')
    await expect.element(rows.nth(1)).toHaveTextContent('2. Cid: 1')
    await expect.element(rows.nth(2)).toHaveTextContent('3. Ann: 0')
    await expect.element(screen.getByTestId('winner-row-b')).toBeVisible()
  })

  it('renders an empty table without players', async () => {
    const screen = await render(<WinnersTable winners={[]} />)

    expect(screen.getByRole('listitem').elements()).toHaveLength(0)
  })
})
