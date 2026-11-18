import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { createSocket } from '@/shared/api'
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

  const onWinnersShownRef = useRef(onWinnersShown)
  onWinnersShownRef.current = onWinnersShown

  // One connection per mounted game screen: a new mount joins the game again, and leaving the
  // screen disconnects (the backend ends the game when the host disconnects)
  useEffect(() => {
    const socket = createSocket()
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
          if (role === 'player') onWinnersShownRef.current?.()
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

    return () => {
      socket.onopen = null
      socket.onmessage = null
      socket.onclose = null
      socket.close()
      setSendMessage(null)
    }
  }, [role, gameId, userId])

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
