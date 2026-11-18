import { PropsWithChildren, useEffect, useState } from 'react'
import { getSocket } from '@/shared/api'
import type { Player, PlayerAnswer } from '@/entities/player' // FSD: cross import
import type { ActiveGameQuestion } from '@/entities/question' // FSD: cross import
import { ActiveGameContext } from './active-game.context'
import {
  buildJoinMessage,
  getActiveQuestion,
  parseServerMessage,
} from './active-game.lib'
import type { ActiveGameRole, SendMessage } from './active-game.types'

type Props = PropsWithChildren<{
  role: ActiveGameRole
  gameId: string
  userId: string | null
  onWinnersShown?: () => void
}>

export function ActiveGameProvider({
  role,
  gameId,
  userId,
  onWinnersShown,
  children,
}: Props) {
  const [players, setPlayers] = useState<Player[]>([])
  const [allQuestions, setAllQuestions] = useState<ActiveGameQuestion[]>([])
  const [activeQuestion, setActiveQuestion] =
    useState<ActiveGameQuestion | null>(null)
  const [sendMessage, setSendMessage] = useState<SendMessage | null>(null)
  const [playerAnswers, setPlayerAnswers] = useState<PlayerAnswer[] | null>(
    null
  )

  useEffect(() => {
    const socket = getSocket()

    if (socket.onopen) {
      return
    }

    const send: SendMessage = (message) => socket.send(JSON.stringify(message))

    socket.onopen = () => {
      setSendMessage(() => send)
      send(buildJoinMessage(role, { gameId, userId }))
    }

    socket.onmessage = (event: MessageEvent<string>) => {
      const message = parseServerMessage(event.data)

      if (!message) return

      switch (message.type) {
        case 'SHOW_WINNERS':
          if (role === 'player') onWinnersShown?.()
          return
        case 'SHOW_ANSWERS':
          setPlayerAnswers(message.payload)
          return
        case 'GAME_DATA':
          setPlayers(message.payload.players)
          setAllQuestions(message.payload.allQuestions)
          setActiveQuestion(getActiveQuestion(message.payload))
          return
      }
    }

    socket.onclose = () => {
      console.log('WebSocket closed')
    }
  }, [])

  useEffect(() => {
    setPlayerAnswers(null)
  }, [activeQuestion])

  return (
    <ActiveGameContext.Provider
      value={{
        activeQuestion,
        allQuestions,
        playerAnswers,
        players,
        sendMessage,
      }}
    >
      {children}
    </ActiveGameContext.Provider>
  )
}
