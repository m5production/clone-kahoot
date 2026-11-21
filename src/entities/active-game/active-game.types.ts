export type SessionState =
  | 'lobby'
  | 'question_open'
  | 'question_closed'
  | 'answers_shown'

export type SessionEndReason = 'finished' | 'host_ended' | 'host_timeout'

export interface SessionPlayer {
  id: string
  name: string
  bgColor: string
  connected: boolean
  answered: boolean
}

export interface SessionQuestionOption {
  id: string
  text: string
}

export interface SessionQuestion {
  id: string
  text: string
  img: string | null
  number: number
  total: number
  /** server timestamp (ms) when the question closes (BR-61) */
  endsAt: number
  /** D-10: 'open' answers with text, 'choice' picks one of `options` */
  type: 'open' | 'choice'
  /** choice questions only; correctness is not revealed before ANSWERS_REVEALED (BR-88) */
  options?: SessionQuestionOption[]
}

/** GET /api/sessions/:id — public data shown on the join page */
export interface SessionSummary {
  state: SessionState
  quizTitle: string
  hostName: string
}

export interface SessionStateMessage {
  sessionId: string
  gameId: string
  quizTitle: string
  state: SessionState
  hostConnected: boolean
  players: SessionPlayer[]
  question: SessionQuestion | null
  /** server clock at broadcast time (ms); used to sync the countdown (NFR-P6) */
  serverNow: number
}

export interface RevealedAnswer {
  playerId: string
  playerName: string
  text: string | null
  isCorrect: boolean
  /** speed-based points earned on this question (BR-70) */
  points: number
  /** choice questions only: the picked option */
  optionId?: string | null
}

export interface AnswersRevealed {
  questionId: string
  /** open questions only */
  acceptedAnswers?: string[]
  /** choice questions only */
  correctOptionId?: string | null
  answers: RevealedAnswer[]
}

export interface Winner {
  place: number
  id: string
  name: string
  score: number
  correctCount: number
}

export interface GameFault {
  code: string
  message: string
}

export type ActiveGameRole = 'host' | 'player'

export type ServerMessage =
  | {
      type: 'JOINED_SESSION'
      payload: { role: ActiveGameRole; sessionId: string }
    }
  | { type: 'SESSION_STATE'; payload: SessionStateMessage }
  | {
      type: 'ANSWER_ACCEPTED'
      payload: { questionId: string; text: string; optionId?: string }
    }
  | { type: 'QUESTION_CLOSED'; payload: { questionId: string } }
  | { type: 'ANSWERS_REVEALED'; payload: AnswersRevealed }
  | { type: 'WINNERS'; payload: { standings: Winner[] } }
  | { type: 'SESSION_ENDED'; payload: { reason: SessionEndReason } }
  | { type: 'FAULT'; payload: GameFault }

export type ClientMessage =
  | { type: 'JOIN_SESSION'; payload: { sessionId: string } }
  | { type: 'START_GAME'; payload: null }
  | { type: 'NEXT_QUESTION'; payload: null }
  | { type: 'CLOSE_QUESTION'; payload: null }
  | { type: 'SHOW_ANSWERS'; payload: null }
  | { type: 'SHOW_WINNERS'; payload: null }
  | { type: 'END_SESSION'; payload: null }
  | {
      type: 'ANSWER_QUESTION'
      payload:
        | { questionId: string; answer: string }
        | { questionId: string; optionId: string }
    }

export type SendMessage = (message: ClientMessage) => void

export interface ActiveGameState {
  /** null until the server assigns a role on JOIN_SESSION */
  role: ActiveGameRole | null
  /** null until the first SESSION_STATE */
  session: SessionStateMessage | null
  /** answers of the current question, set on ANSWERS_REVEALED */
  revealed: AnswersRevealed | null
  /** the player's own answer to the open question, kept locally (echoed by ANSWER_ACCEPTED) */
  myAnswer: { questionId: string; text: string; optionId?: string } | null
  standings: Winner[] | null
  endReason: SessionEndReason | null
  sendMessage: SendMessage | null
  /** serverNow − local Date.now() at the last SESSION_STATE; adds to local time to get server time */
  clockOffset: number
}
