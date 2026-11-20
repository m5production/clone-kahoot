export interface Question {
  id: string
  gameId: string
  order: number
  text: string
  img: string | null
  answersCount: number
}

export interface RawQuestion {
  gameId: string
  text: string
  img?: string
}

export type ActiveGameQuestion = Pick<Question, 'id' | 'img' | 'text'>
