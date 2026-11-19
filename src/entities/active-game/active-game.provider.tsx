import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { createSocket, getApiErrorMessage } from '@/shared/api'
import type { Player, PlayerAnswer, PlayerScore } from '@/entities/player' // FSD: cross import
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
  onWinnersShown?: () => void
}>

export function ActiveGameProvider({
  role,
  gameId,
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
  const [standings, setStandings] = useState<PlayerScore[] | null>(null)

  const onWinnersShownRef = useRef(onWinnersShown)
  onWinnersShownRef.current = onWinnersShown

  // One connection per mounted game screen: a new mount joins the game again, and leaving the
  // screen disconnects (the backend ends the game when the host disconnects)
  useEffect(() => {
    let socket: WebSocket | null = null
    let cancelled = false

    const connect = async () => {
      try {
        socket = await createSocket()
      } catch (error) {
        toast(`Could not connect to the game: ${getApiErrorMessage(error)}`)
        return
      }
      if (cancelled) {
        socket.close()
        return
      }

      const send: SendMessage = (message) =>
        socket?.send(JSON.stringify(message))

      socket.onopen = () => {
        setSendMessage(() => send)
        send(buildJoinMessage(role, gameId))
      }

      socket.onmessage = (event: MessageEvent<string>) => {
        const message = parseServerMessage(event.data)

        if (!message) return

        switch (message.type) {
          case 'FAULT':
            toast(message.payload.message)
            return
          case 'SHOW_WINNERS':
            setStandings(message.payload.standings)
            if (role === 'player') onWinnersShownRef.current?.()
            return
          case 'SHOW_ANSWERS':
            setPlayerAnswers(message.payload.answers)
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
    }

    connect()

    return () => {
      cancelled = true
      if (socket) {
        socket.onopen = null
        socket.onmessage = null
        socket.onclose = null
        socket.close()
      }
      setSendMessage(null)
    }
  }, [role, gameId])

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
        standings,
      }}
    >
      {children}
    </ActiveGameContext.Provider>
  )
}
