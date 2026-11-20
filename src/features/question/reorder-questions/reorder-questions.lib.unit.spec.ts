import { describe, expect, it } from 'vitest'
import { moveQuestion } from './reorder-questions.lib'

const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }]

describe('moveQuestion', () => {
  it('moves an item up and down', () => {
    expect(moveQuestion(questions, 1, -1)).toEqual(['q2', 'q1', 'q3'])
    expect(moveQuestion(questions, 1, 1)).toEqual(['q1', 'q3', 'q2'])
  })

  it('returns null out of bounds', () => {
    expect(moveQuestion(questions, 0, -1)).toBeNull()
    expect(moveQuestion(questions, 2, 1)).toBeNull()
    expect(moveQuestion(questions, -1, 1)).toBeNull()
    expect(moveQuestion([], 0, 1)).toBeNull()
  })
})
