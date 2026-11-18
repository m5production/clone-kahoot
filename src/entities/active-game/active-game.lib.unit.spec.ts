import { describe, expect, it } from 'vitest'
import {
  buildJoinMessage,
  getActiveQuestion,
  parseServerMessage,
} from './active-game.lib'
import type { ActiveGame } from './active-game.types'

const game: ActiveGame = {
  id: 'game-1',
  players: [],
  allQuestions: [
    { id: 'q1', gameId: 'game-1', text: 'First', img: null },
    { id: 'q2', gameId: 'game-1', text: 'Second', img: 'https://img' },
  ],
  activeQuestionId: 'q2',
}

describe('parseServerMessage', () => {
  it('parses every known message type', () => {
    expect(parseServerMessage(JSON.stringify({ type: 'GAME_DATA', payload: game }))).toEqual({
      type: 'GAME_DATA',
      payload: game,
    })
    expect(parseServerMessage('{"type":"SHOW_WINNERS","payload":null}')).toEqual({
      type: 'SHOW_WINNERS',
      payload: null,
    })
    expect(parseServerMessage('{"type":"FAULT","payload":"No game"}')).toEqual({
      type: 'FAULT',
      payload: 'No game',
    })
  })

  it.each([
    ['invalid JSON', 'not json'],
    ['unknown type', '{"type":"HELLO","payload":null}'],
    ['no type', '{"payload":null}'],
    ['non-string type', '{"type":1}'],
    ['not an object', '"GAME_DATA"'],
    ['null', 'null'],
  ])('returns null for %s', (_, raw) => {
    expect(parseServerMessage(raw)).toBeNull()
  })
})

describe('getActiveQuestion', () => {
  it('returns the question with the active id', () => {
    expect(getActiveQuestion(game)).toEqual(game.allQuestions[1])
  })

  it('returns null when nothing is active or the id is unknown', () => {
    expect(getActiveQuestion({ ...game, activeQuestionId: null })).toBeNull()
    expect(getActiveQuestion({ ...game, activeQuestionId: 'missing' })).toBeNull()
  })
})

describe('buildJoinMessage', () => {
  it('starts the game for the host', () => {
    expect(buildJoinMessage('host', { gameId: 'game-1', userId: 'u1' })).toEqual({
      type: 'START_GAME',
      payload: { gameId: 'game-1' },
    })
  })

  it('connects a player by user id', () => {
    expect(buildJoinMessage('player', { gameId: 'game-1', userId: 'u1' })).toEqual({
      type: 'PLAYER_CONNECTED',
      payload: { userId: 'u1' },
    })
  })
})
