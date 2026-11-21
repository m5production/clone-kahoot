import { describe, expect, it } from 'vitest'
import { isQuestionReady, isQuizReady } from './question.lib'

const openQuestion = (overrides = {}) => ({
  text: 'Q?',
  type: 'open' as const,
  answersCount: 1,
  optionsCount: 0,
  ...overrides,
})

const choiceQuestion = (overrides = {}) => ({
  text: 'Q?',
  type: 'choice' as const,
  answersCount: 0,
  optionsCount: 4,
  ...overrides,
})

describe('isQuestionReady', () => {
  it('an open question needs text and at least one accepted answer (BR-49)', () => {
    expect(isQuestionReady(openQuestion())).toBe(true)
    expect(isQuestionReady(openQuestion({ text: '' }))).toBe(false)
    expect(isQuestionReady(openQuestion({ text: '   ' }))).toBe(false)
    expect(isQuestionReady(openQuestion({ answersCount: 0 }))).toBe(false)
  })

  it('a choice question needs text and 2-4 options (D-15, BR-86)', () => {
    expect(isQuestionReady(choiceQuestion())).toBe(true)
    expect(isQuestionReady(choiceQuestion({ optionsCount: 2 }))).toBe(true)
    expect(isQuestionReady(choiceQuestion({ optionsCount: 1 }))).toBe(false)
    expect(isQuestionReady(choiceQuestion({ optionsCount: 5 }))).toBe(false)
    expect(isQuestionReady(choiceQuestion({ text: '' }))).toBe(false)
    // options of a choice question do not rescue a missing accepted-answers set
    expect(isQuestionReady(choiceQuestion({ answersCount: 3 }))).toBe(true)
    expect(
      isQuestionReady(openQuestion({ optionsCount: 4, answersCount: 0 })),
    ).toBe(false)
  })
})

describe('isQuizReady', () => {
  it('needs at least one question and all of them ready', () => {
    expect(isQuizReady([])).toBe(false)
    expect(isQuizReady([openQuestion()])).toBe(true)
    // a quiz may mix open and choice questions (D-15)
    expect(isQuizReady([openQuestion(), choiceQuestion()])).toBe(true)
    expect(
      isQuizReady([
        openQuestion(),
        openQuestion({ text: '', answersCount: 0 }),
      ]),
    ).toBe(false)
  })
})
