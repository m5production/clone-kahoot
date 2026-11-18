export interface AcceptedAnswer {
  id: string
  questionId: string
  text: string
}

export type RawAcceptedAnswer = Omit<AcceptedAnswer, 'id'>
