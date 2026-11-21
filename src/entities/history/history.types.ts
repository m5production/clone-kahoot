export type SessionStatus = 'finished' | 'aborted'

/** GET /sessions — one row of the host's history (FR-80) */
export interface HistoryEntry {
  id: string
  gameId: string | null
  quizTitle: string
  status: SessionStatus
  startedAt: string
  endedAt: string | null
  playerCount: number
  winner: { name: string; score: number } | null
}

export interface ReportStanding {
  place: number | null
  userId: string
  nickname: string
  score: number
  correctCount: number
}

export interface ReportAnswer {
  userId: string
  nickname: string
  text: string | null
  isCorrect: boolean
  responseTimeMs: number | null
  points: number
}

export interface ReportQuestion {
  id: string
  position: number
  text: string
  img: string | null
  timeLimitSec: number
  acceptedAnswers: string[]
  answers: ReportAnswer[]
}

/** GET /sessions/:id/report — the full breakdown of a finished session (FR-81) */
export interface SessionReport {
  id: string
  gameId: string | null
  quizTitle: string
  status: SessionStatus
  startedAt: string
  endedAt: string | null
  standings: ReportStanding[]
  questions: ReportQuestion[]
}
