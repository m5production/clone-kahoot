import { describe, expect, it } from 'vitest'
import { createAnswer, createPlayer } from './player.fixtures'
import { findPlayerAnswer, hasAnsweredQuestion } from './player.lib'

describe('findPlayerAnswer / hasAnsweredQuestion', () => {
  const player = createPlayer({ id: 'a', answers: [createAnswer('q1')] })

  it('finds the answer to the question', () => {
    expect(findPlayerAnswer(player, 'q1')).toEqual(createAnswer('q1'))
    expect(hasAnsweredQuestion(player, 'q1')).toBe(true)
  })

  it('reports a question without an answer', () => {
    expect(findPlayerAnswer(player, 'q2')).toBeUndefined()
    expect(hasAnsweredQuestion(player, 'q2')).toBe(false)
  })
})
