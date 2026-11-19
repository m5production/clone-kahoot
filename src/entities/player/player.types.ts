// GAME_DATA intentionally carries only which questions were answered:
// answer texts and correctness are revealed separately via SHOW_ANSWERS
export interface PlayerQuestionAnswer {
  questionId: string
}

export interface Player {
  id: string
  name: string
  bgColor: string
  answers: PlayerQuestionAnswer[]
  connected: boolean
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
