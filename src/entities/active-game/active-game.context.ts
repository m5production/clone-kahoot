import { createContext, useContext } from 'react'
import type { ActiveGameState } from './active-game.types'

export const ActiveGameContext = createContext<ActiveGameState>({
  activeQuestion: null,
  allQuestions: [],
  playerAnswers: null,
  players: [],
  sendMessage: null,
})

export const useActiveGame = () => useContext(ActiveGameContext)
