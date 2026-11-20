import { describe, expect, it } from 'vitest'
import {
  duplicateAnswerIndexes,
  type QuestionFormValues,
  toAcceptedAnswersPayload,
  toQuestionFormValues,
  toQuestionPayload,
} from './edit-question.lib'

const values: QuestionFormValues = {
  text: 'Capital of France?',
  img: '',
  timeLimitSec: '30',
  answers: [{ answerText: 'Paris' }, { answerText: 'paris' }],
}

describe('toQuestionFormValues', () => {
  it('maps a question and its accepted answers to form values', () => {
    expect(
      toQuestionFormValues(
        { text: 'Q', img: 'https://img', timeLimitSec: 60 },
        [{ text: 'A' }, { text: 'B' }],
      ),
    ).toEqual({
      text: 'Q',
      img: 'https://img',
      timeLimitSec: '60',
      answers: [{ answerText: 'A' }, { answerText: 'B' }],
    })
  })

  it('gives a fresh question an empty image field and one empty answer field', () => {
    expect(
      toQuestionFormValues({ text: '', img: null, timeLimitSec: 20 }, []),
    ).toEqual({
      text: '',
      img: '',
      timeLimitSec: '20',
      answers: [{ answerText: '' }],
    })
  })
})

describe('toQuestionPayload', () => {
  it('sends a missing image as null', () => {
    expect(toQuestionPayload(values, { id: 'q1' })).toEqual({
      id: 'q1',
      text: 'Capital of France?',
      img: null,
      timeLimitSec: 30,
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
