export interface Question {
  id: string
  gameId: string
  order: number
  text: string
  img: string | null
  /** seconds to answer, one of 10/20/30/60/90/120 (BR-48) */
  timeLimitSec: number
  answersCount: number
}

export interface RawQuestion {
  gameId: string
  text: string
  img?: string
  timeLimitSec?: number
}

export type ActiveGameQuestion = Pick<Question, 'id' | 'img' | 'text'>
