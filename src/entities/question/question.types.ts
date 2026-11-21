/** D-10: 'open' — a free-text answer, 'choice' — pick one of 2-4 options */
export type QuestionType = 'open' | 'choice'

export interface Question {
  id: string
  gameId: string
  order: number
  text: string
  img: string | null
  /** seconds to answer, one of 10/20/30/60/90/120 (BR-48) */
  timeLimitSec: number
  type: QuestionType
  answersCount: number
  optionsCount: number
}

export interface RawQuestion {
  gameId: string
  text: string
  img?: string
  timeLimitSec?: number
}

export type ActiveGameQuestion = Pick<Question, 'id' | 'img' | 'text'>
