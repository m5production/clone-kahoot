import type { ActiveGameState } from './active-game.types'

export const createActiveGameState = (
  overrides: Partial<ActiveGameState> = {}
): ActiveGameState => ({
  players: [],
  allQuestions: [
    { id: 'q1', text: '2+2?', img: null },
    { id: 'q2', text: 'Capital of France?', img: null },
  ],
  activeQuestion: { id: 'q1', text: '2+2?', img: null },
  playerAnswers: null,
  sendMessage: () => {},
  ...overrides,
})
