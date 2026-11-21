import { describe, expect, it } from 'vitest'
import { createSessionState } from './active-game.fixtures'
import {
  buildJoinPath,
  buildJoinUrl,
  extractSessionId,
  parseServerMessage,
} from './active-game.lib'

describe('parseServerMessage', () => {
  it('parses every known message type', () => {
    const session = createSessionState()
    expect(
      parseServerMessage(
        JSON.stringify({ type: 'SESSION_STATE', payload: session }),
      ),
    ).toEqual({ type: 'SESSION_STATE', payload: session })
    expect(
      parseServerMessage('{"type":"WINNERS","payload":{"standings":[]}}'),
    ).toEqual({ type: 'WINNERS', payload: { standings: [] } })
    expect(
      parseServerMessage(
        '{"type":"SESSION_ENDED","payload":{"reason":"host_timeout"}}',
      ),
    ).toEqual({ type: 'SESSION_ENDED', payload: { reason: 'host_timeout' } })
    expect(
      parseServerMessage(
        '{"type":"FAULT","payload":{"code":"X","message":"No session"}}',
      ),
    ).toEqual({
      type: 'FAULT',
      payload: { code: 'X', message: 'No session' },
    })
  })

  it.each([
    'not json',
    '{"type":"GAME_DATA"}',
    '{"type":"PLAYER_CONNECTED"}',
    '{"type":42}',
    'null',
    '{"type":"SESSION_STATE"}',
    '{"type":"FAULT","payload":null}',
  ])('ignores the malformed message %s', (raw) => {
    expect(parseServerMessage(raw)).toBeNull()
  })
})

describe('extractSessionId', () => {
  it.each([
    ['abc-123', 'abc-123'],
    ['  abc-123  ', 'abc-123'],
    ['https://app.example/join/abc-123', 'abc-123'],
    ['http://localhost:5173/join/abc-123', 'abc-123'],
    ['/join/abc-123', 'abc-123'],
  ])('extracts the id from %s', (input, expected) => {
    expect(extractSessionId(input)).toBe(expected)
  })
})

describe('buildJoinPath', () => {
  it('builds the join path', () => {
    expect(buildJoinPath('s1')).toBe('/join/s1')
  })
})

describe('buildJoinUrl', () => {
  it('builds an absolute join URL including the app base path', () => {
    expect(buildJoinUrl('s1')).toBe(
      `${window.location.origin}${import.meta.env.BASE_URL}join/s1`,
    )
  })
})
