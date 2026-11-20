import { createContext, useContext } from 'react'
import type { ActiveGameState } from './active-game.types'

export const ActiveGameContext = createContext<ActiveGameState>({
  endReason: null,
  myAnswer: null,
  revealed: null,
  role: null,
  sendMessage: null,
  session: null,
  standings: null,
})

export const useActiveGame = () => useContext(ActiveGameContext)
