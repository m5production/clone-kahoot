export interface Player {
  id: string
  name: string
  bgColor: string
  connected: boolean
  /** answered the currently open question (from SESSION_STATE) */
  answered: boolean
}

/** a row of ANSWERS_REVEALED — shown only after the question is closed */
export interface PlayerAnswer {
  playerId: string
  playerName: string
  text: string | null
  isCorrect: boolean
  /** speed-based points earned on the question (BR-70) */
  points: number
}

export interface PlayerScore {
  place: number
  id: string
  name: string
  score: number
  correctCount: number
}
