import type { Player, PlayerAnswer, PlayerScore } from '@/entities/player' // FSD: cross import
import type { ActiveGameQuestion } from '@/entities/question' // FSD: cross import

export interface ActiveGame {
  id: string
  players: Player[]
  allQuestions: ActiveGameQuestion[]
  activeQuestionId: string | null
}

export interface GameFault {
  code: string
  message: string
}

export type ServerMessage =
  | { type: 'GAME_DATA'; payload: ActiveGame }
  | { type: 'FAULT'; payload: GameFault }
  | { type: 'SHOW_ANSWERS'; payload: { answers: PlayerAnswer[] } }
  | { type: 'SHOW_WINNERS'; payload: { standings: PlayerScore[] } }
  | { type: 'END_GAME'; payload: null }

export type ClientMessage =
  | { type: 'START_GAME'; payload: { gameId: string } }
  | { type: 'PLAYER_CONNECTED'; payload: { gameId: string } }
  | { type: 'CHANGE_QUESTION'; payload: { questionId: string } }
  | {
      type: 'ANSWER_QUESTION'
      payload: { questionId: string; answer: string }
    }
  | { type: 'SHOW_ANSWERS'; payload: { questionId: string } }
  | { type: 'SHOW_WINNERS'; payload: null }
  | { type: 'END_GAME'; payload: null }

export type SendMessage = (message: ClientMessage) => void

export type ActiveGameRole = 'host' | 'player'

export interface ActiveGameState {
  players: Player[]
  allQuestions: ActiveGameQuestion[]
  activeQuestion: ActiveGameQuestion | null
  playerAnswers: PlayerAnswer[] | null
  standings: PlayerScore[] | null
  sendMessage: SendMessage | null
}
