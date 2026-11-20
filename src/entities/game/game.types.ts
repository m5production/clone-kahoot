export interface Game {
  id: string
  adminId: string
  title: string
  createdAt: string
  updatedAt: string
}

/** GET /games list item (FR-51) */
export interface GameSummary {
  id: string
  title: string
  questionCount: number
  updatedAt: string
}
