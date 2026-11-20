import type { Player } from './player.types'

export const findPlayer = (players: Player[], playerId: string | null) =>
  playerId ? players.find(({ id }) => id === playerId) : undefined
