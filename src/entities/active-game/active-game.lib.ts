import type { ActiveGameQuestion } from '@/entities/question' // FSD: cross import
import type {
  ActiveGame,
  ActiveGameRole,
  ClientMessage,
  ServerMessage,
} from './active-game.types'

const SERVER_MESSAGE_TYPES: ReadonlySet<string> = new Set<
  ServerMessage['type']
>(['GAME_DATA', 'FAULT', 'SHOW_ANSWERS', 'SHOW_WINNERS', 'END_GAME'])

const isServerMessage = (value: unknown): value is ServerMessage =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  typeof value.type === 'string' &&
  SERVER_MESSAGE_TYPES.has(value.type)

export const parseServerMessage = (raw: string): ServerMessage | null => {
  try {
    const parsed: unknown = JSON.parse(raw)

    return isServerMessage(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const getActiveQuestion = (
  game: Pick<ActiveGame, 'allQuestions' | 'activeQuestionId'>
): ActiveGameQuestion | null =>
  game.allQuestions.find(({ id }) => id === game.activeQuestionId) ?? null

export const buildJoinMessage = (
  role: ActiveGameRole,
  gameId: string
): ClientMessage =>
  role === 'host'
    ? { type: 'START_GAME', payload: { gameId } }
    : { type: 'PLAYER_CONNECTED', payload: { gameId } }
