import { describe, expect, it } from 'vitest'
import {
  duplicateAnswerIndexes,
  duplicateOptionIndexes,
  type QuestionFormValues,
  toAcceptedAnswersPayload,
  toAnswerOptionsPayload,
  toQuestionFormValues,
  toQuestionPayload,
} from './edit-question.lib'

const values: QuestionFormValues = {
  text: 'Capital of France?',
  img: '',
  timeLimitSec: '30',
  type: 'open',
  answers: [{ answerText: 'Paris' }, { answerText: 'paris' }],
  options: [
    { optionText: 'Rome', isCorrect: false },
    { optionText: 'Paris', isCorrect: true },
    { optionText: 'paris', isCorrect: false },
  ],
}

describe('toQuestionFormValues', () => {
  it('maps a question and its accepted answers to form values', () => {
    expect(
      toQuestionFormValues(
        { text: 'Q', img: 'https://img', timeLimitSec: 60, type: 'open' },
        [{ text: 'A' }, { text: 'B' }],
        [],
      ),
    ).toEqual({
      text: 'Q',
      img: 'https://img',
      timeLimitSec: '60',
      type: 'open',
      answers: [{ answerText: 'A' }, { answerText: 'B' }],
      options: [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
      ],
    })
  })

  it('maps a choice question with its options', () => {
    expect(
      toQuestionFormValues(
        { text: 'Pick', img: null, timeLimitSec: 20, type: 'choice' },
        [],
        [
          { text: 'a', isCorrect: false },
          { text: 'b', isCorrect: true },
        ],
      ),
    ).toEqual({
      text: 'Pick',
      img: '',
      timeLimitSec: '20',
      type: 'choice',
      answers: [{ answerText: '' }],
      options: [
        { optionText: 'a', isCorrect: false },
        { optionText: 'b', isCorrect: true },
      ],
    })
  })

  it('gives a fresh question an empty image field and one empty answer field', () => {
    expect(
      toQuestionFormValues(
        { text: '', img: null, timeLimitSec: 20, type: 'open' },
        [],
        [],
      ),
    ).toEqual({
      text: '',
      img: '',
      timeLimitSec: '20',
      type: 'open',
      answers: [{ answerText: '' }],
      options: [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
      ],
    })
  })
})

describe('toQuestionPayload', () => {
  it('sends a missing image as null and keeps the type', () => {
    expect(toQuestionPayload(values, { id: 'q1' })).toEqual({
      id: 'q1',
      text: 'Capital of France?',
      img: null,
      timeLimitSec: 30,
      type: 'open',
    })
  })

  it('keeps an image url', () => {
    expect(
      toQuestionPayload({ ...values, img: 'https://img' }, { id: 'q1' }).img,
    ).toBe('https://img')
  })
})

describe('toAcceptedAnswersPayload', () => {
  it('binds every answer to the question', () => {
    expect(toAcceptedAnswersPayload(values, 'q1')).toEqual([
      { text: 'Paris', questionId: 'q1' },
      { text: 'paris', questionId: 'q1' },
    ])
  })
})

describe('toAnswerOptionsPayload', () => {
  it('maps option fields to the replace body', () => {
    expect(toAnswerOptionsPayload(values)).toEqual([
      { text: 'Rome', isCorrect: false },
      { text: 'Paris', isCorrect: true },
      { text: 'paris', isCorrect: false },
    ])
  })
})

describe('duplicateAnswerIndexes', () => {
  it('flags fields that repeat an earlier answer after normalization', () => {
    expect(duplicateAnswerIndexes(values)).toEqual([1])
    expect(
      duplicateAnswerIndexes({
        ...values,
        answers: [
          { answerText: 'Paris' },
          { answerText: 'Lutetia' },
          { answerText: ' PARIS ' },
        ],
      }),
    ).toEqual([2])
    expect(duplicateAnswerIndexes({ ...values, answers: [] })).toEqual([])
    expect(
      duplicateAnswerIndexes({
        ...values,
        answers: [{ answerText: 'Paris' }, { answerText: ' ' }],
      }),
    ).toEqual([])
  })
})

describe('duplicateOptionIndexes', () => {
  it('flags options that repeat an earlier option after normalization (BR-86)', () => {
    expect(duplicateOptionIndexes(values)).toEqual([2])
    expect(
      duplicateOptionIndexes({
        ...values,
        options: [
          { optionText: 'a', isCorrect: true },
          { optionText: ' ', isCorrect: false },
        ],
      }),
    ).toEqual([])
  })
})
