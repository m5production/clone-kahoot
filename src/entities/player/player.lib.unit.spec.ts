import { describe, expect, it } from 'vitest'
import { createAnswer, createPlayer } from './player.fixtures'
import {
  findPlayerAnswer,
  hasAnsweredQuestion,
  rankPlayersByScore,
} from './player.lib'

describe('rankPlayersByScore', () => {
  it('counts only correct answers and sorts by score, best first', () => {
    const players = [
      createPlayer({ id: 'a', name: 'Ann', answers: [createAnswer('q1', false)] }),
      createPlayer({
        id: 'b',
        name: 'Bob',
        answers: [createAnswer('q1', true), createAnswer('q2', true)],
      }),
      createPlayer({
        id: 'c',
        name: 'Cid',
        answers: [createAnswer('q1', true), createAnswer('q2', false)],
      }),
    ]

    expect(rankPlayersByScore(players)).toEqual([
      { id: 'b', name: 'Bob', score: 2 },
      { id: 'c', name: 'Cid', score: 1 },
      { id: 'a', name: 'Ann', score: 0 },
    ])
  })

  it('keeps the join order for equal scores', () => {
    const players = [createPlayer({ id: 'first' }), createPlayer({ id: 'second' })]

    expect(rankPlayersByScore(players).map(({ id }) => id)).toEqual([
      'first',
      'second',
    ])
  })

  it('returns an empty list without players', () => {
    expect(rankPlayersByScore([])).toEqual([])
  })
})

describe('findPlayerAnswer / hasAnsweredQuestion', () => {
  const player = createPlayer({ id: 'a', answers: [createAnswer('q1', true, '4')] })

  it('finds the answer to the question', () => {
    expect(findPlayerAnswer(player, 'q1')).toEqual(createAnswer('q1', true, '4'))
    expect(hasAnsweredQuestion(player, 'q1')).toBe(true)
  })

  it('reports a question without an answer', () => {
    expect(findPlayerAnswer(player, 'q2')).toBeUndefined()
    expect(hasAnsweredQuestion(player, 'q2')).toBe(false)
  })
})
