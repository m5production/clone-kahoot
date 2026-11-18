export interface PlayerQuestionAnswer {
  questionId: string
  text: string
  isCorrect: boolean
}

export interface Player {
  id: string
  name: string
  bgColor: string
  answers: PlayerQuestionAnswer[]
}

export interface PlayerAnswer {
  playerId: string
  playerName: string
  playerAnswer: {
    questionId: string
    text: string | null
    isCorrect: boolean
  }
}

export interface PlayerScore {
  id: string
  name: string
  score: number
}
