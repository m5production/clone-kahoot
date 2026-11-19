import type { Player, PlayerQuestionAnswer } from './player.types'

export const createPlayer = (
  overrides: Partial<Player> & Pick<Player, 'id'>
): Player => ({
  name: `Player ${overrides.id}`,
  bgColor: '#123456',
  answers: [],
  connected: true,
  ...overrides,
})

export const createAnswer = (questionId: string): PlayerQuestionAnswer => ({
  questionId,
})
