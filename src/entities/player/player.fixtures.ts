import type { Player, PlayerQuestionAnswer } from './player.types'

export const createPlayer = (
  overrides: Partial<Player> & Pick<Player, 'id'>
): Player => ({
  name: `Player ${overrides.id}`,
  bgColor: '#123456',
  answers: [],
  ...overrides,
})

export const createAnswer = (
  questionId: string,
  isCorrect: boolean,
  text = isCorrect ? 'right' : 'wrong'
): PlayerQuestionAnswer => ({ questionId, isCorrect, text })
