import type { Player } from './player.types'

export const createPlayer = (
  overrides: Partial<Player> & Pick<Player, 'id'>,
): Player => ({
  name: `Player ${overrides.id}`,
  bgColor: '#123456',
  connected: true,
  answered: false,
  ...overrides,
})
