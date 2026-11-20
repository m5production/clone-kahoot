import { describe, expect, it } from 'vitest'
import { isQuestionReady, isQuizReady } from './question.lib'

describe('isQuestionReady', () => {
  it('needs text and at least one accepted answer (BR-49)', () => {
    expect(isQuestionReady({ text: 'Q?', answersCount: 1 })).toBe(true)
    expect(isQuestionReady({ text: '', answersCount: 1 })).toBe(false)
    expect(isQuestionReady({ text: '   ', answersCount: 1 })).toBe(false)
    expect(isQuestionReady({ text: 'Q?', answersCount: 0 })).toBe(false)
  })
})

describe('isQuizReady', () => {
  it('needs at least one question and all of them ready', () => {
    expect(isQuizReady([])).toBe(false)
    expect(isQuizReady([{ text: 'Q?', answersCount: 1 }])).toBe(true)
    expect(
      isQuizReady([
        { text: 'Q?', answersCount: 1 },
        { text: '', answersCount: 0 },
      ]),
    ).toBe(false)
  })
})
