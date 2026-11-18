import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { createAnswer, createPlayer } from './player.fixtures'
import { WinnersTable } from './player.ui.winners-table'

describe('WinnersTable', () => {
  it('lists players by the number of correct answers', async () => {
    const screen = await render(
      <WinnersTable
        players={[
          createPlayer({ id: 'a', name: 'Ann', answers: [createAnswer('q1', false)] }),
          createPlayer({
            id: 'b',
            name: 'Bob',
            answers: [createAnswer('q1', true), createAnswer('q2', true)],
          }),
          createPlayer({ id: 'c', name: 'Cid', answers: [createAnswer('q1', true)] }),
        ]}
      />
    )

    const rows = screen.getByTestId('winners-table').getByRole('listitem')

    await expect.element(rows.nth(0)).toHaveTextContent('1. Bob: 2')
    await expect.element(rows.nth(1)).toHaveTextContent('2. Cid: 1')
    await expect.element(rows.nth(2)).toHaveTextContent('3. Ann: 0')
    await expect.element(screen.getByTestId('winner-row-b')).toBeVisible()
  })

  it('renders an empty table without players', async () => {
    const screen = await render(<WinnersTable players={[]} />)

    expect(screen.getByRole('listitem').elements()).toHaveLength(0)
  })
})
