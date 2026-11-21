import type { ServerMessage } from './active-game.types'

const SERVER_MESSAGE_TYPES: ReadonlySet<string> = new Set<
  ServerMessage['type']
>([
  'JOINED_SESSION',
  'SESSION_STATE',
  'ANSWER_ACCEPTED',
  'QUESTION_CLOSED',
  'ANSWERS_REVEALED',
  'WINNERS',
  'SESSION_ENDED',
  'FAULT',
])

const isServerMessage = (value: unknown): value is ServerMessage =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  typeof value.type === 'string' &&
  SERVER_MESSAGE_TYPES.has(value.type) &&
  'payload' in value &&
  typeof value.payload === 'object' &&
  value.payload !== null

export const parseServerMessage = (raw: string): ServerMessage | null => {
  try {
    const parsed: unknown = JSON.parse(raw)

    return isServerMessage(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Join links are `/join/<sessionId>`; the form also accepts a bare id */
export const extractSessionId = (input: string): string => {
  const trimmed = input.trim()
  const match = trimmed.match(/\/join\/([A-Za-z0-9_-]+)/)

  return match ? match[1] : trimmed
}

export const buildJoinPath = (sessionId: string) => `/join/${sessionId}`

// the app may be hosted under a base path (GitHub Pages: /clone-kahoot/);
// BASE_URL keeps the trailing slash, buildJoinPath starts with one
export const buildJoinUrl = (sessionId: string) =>
  `${window.location.origin}${import.meta.env.BASE_URL}${buildJoinPath(sessionId).slice(1)}`
