import type {
  ActiveGameState,
  SessionPlayer,
  SessionQuestion,
  SessionStateMessage,
} from './active-game.types'

export const createSessionPlayer = (
  overrides: Partial<SessionPlayer> & Pick<SessionPlayer, 'id'>,
): SessionPlayer => ({
  name: `Player ${overrides.id}`,
  bgColor: '#123456',
  connected: true,
  answered: false,
  ...overrides,
})

export const createSessionQuestion = (
  overrides: Partial<SessionQuestion> = {},
): SessionQuestion => ({
  id: 'q1',
  text: '2+2?',
  img: null,
  number: 1,
  total: 2,
  endsAt: Date.now() + 20_000,
  ...overrides,
})

export const createSessionState = (
  overrides: Partial<SessionStateMessage> = {},
): SessionStateMessage => ({
  sessionId: 's1',
  gameId: 'g1',
  quizTitle: 'Test quiz',
  state: 'question_open',
  hostConnected: true,
  players: [],
  question: createSessionQuestion(),
  serverNow: Date.now(),
  ...overrides,
})

export const createActiveGameState = (
  overrides: Partial<ActiveGameState> = {},
): ActiveGameState => ({
  role: 'host',
  session: createSessionState(),
  revealed: null,
  myAnswer: null,
  standings: null,
  endReason: null,
  sendMessage: () => {},
  clockOffset: 0,
  ...overrides,
})
