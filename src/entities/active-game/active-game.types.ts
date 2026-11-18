import type { Player, PlayerAnswer } from '@/entities/player' // FSD: cross import
import type { ActiveGameQuestion, Question } from '@/entities/question' // FSD: cross import

export interface ActiveGame {
  id: string
  players: Player[]
  allQuestions: Question[]
  activeQuestionId: string | null
}

export type ServerMessage =
  | { type: 'GAME_DATA'; payload: ActiveGame }
  | { type: 'FAULT'; payload: string }
  | { type: 'SHOW_ANSWERS'; payload: PlayerAnswer[] }
  | { type: 'SHOW_WINNERS'; payload: null }
  | { type: 'END_GAME'; payload: null }

export type ClientMessage =
  | { type: 'START_GAME'; payload: { gameId: string } }
  | { type: 'PLAYER_CONNECTED'; payload: { userId: string | null } }
  // `qusetionId` matches the backend protocol
  | { type: 'CHANGE_QUESTION'; payload: { qusetionId: string } }
  | {
      type: 'ANSWER_QUESTION'
      payload: {
        questionId: string | undefined
        answer: string
        playerId: string | null
      }
    }
  | { type: 'SHOW_ANSWERS'; payload: { questionId: string | undefined } }
  | { type: 'SHOW_WINNERS'; payload: null }
  | { type: 'END_GAME'; payload: null }

export type SendMessage = (message: ClientMessage) => void

export type ActiveGameRole = 'host' | 'player'

export interface ActiveGameState {
  players: Player[]
  allQuestions: ActiveGameQuestion[]
  activeQuestion: ActiveGameQuestion | null
  playerAnswers: PlayerAnswer[] | null
  sendMessage: SendMessage | null
}
