import { describe, expect, it } from 'vitest'
import {
  toAcceptedAnswersPayload,
  toQuestionFormValues,
  toQuestionPayload,
  type QuestionFormValues,
} from './edit-question.lib'

const values: QuestionFormValues = {
  text: 'Capital of France?',
  img: '',
  answers: [{ answerText: 'Paris' }, { answerText: 'paris' }],
}

describe('toQuestionFormValues', () => {
  it('maps a question and its accepted answers to form values', () => {
    expect(
      toQuestionFormValues({ text: 'Q', img: 'https://img' }, [{ text: 'A' }, { text: 'B' }])
    ).toEqual({
      text: 'Q',
      img: 'https://img',
      answers: [{ answerText: 'A' }, { answerText: 'B' }],
    })
  })

  it('gives a fresh question an empty image field and one empty answer field', () => {
    expect(toQuestionFormValues({ text: '', img: null }, [])).toEqual({
      text: '',
      img: '',
      answers: [{ answerText: '' }],
    })
  })
})

describe('toQuestionPayload', () => {
  it('sends a missing image as null', () => {
    expect(toQuestionPayload(values, { id: 'q1', gameId: 'g1' })).toEqual({
      id: 'q1',
      gameId: 'g1',
      text: 'Capital of France?',
      img: null,
    })
  })

  it('keeps an image url', () => {
    expect(
      toQuestionPayload({ ...values, img: 'https://img' }, { id: 'q1', gameId: 'g1' }).img
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
