import { describe, expect, it } from 'vitest'
import { createPlayer } from './player.fixtures'
import { findPlayer } from './player.lib'

describe('findPlayer', () => {
  const players = [createPlayer({ id: 'a' }), createPlayer({ id: 'b' })]

  it('finds the player by id', () => {
    expect(findPlayer(players, 'b')).toEqual(players[1])
  })

  it('reports an unknown or missing id', () => {
    expect(findPlayer(players, 'x')).toBeUndefined()
    expect(findPlayer(players, null)).toBeUndefined()
  })
})
