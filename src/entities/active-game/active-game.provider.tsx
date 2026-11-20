import { type PropsWithChildren, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { createSocket, getApiErrorMessage } from '@/shared/api'
import { ActiveGameContext } from './active-game.context'
import { parseServerMessage } from './active-game.lib'
import type {
  ActiveGameRole,
  AnswersRevealed,
  SendMessage,
  SessionEndReason,
  SessionStateMessage,
  Winner,
} from './active-game.types'

const RECONNECT_DELAY_MS = 2000

type Props = PropsWithChildren<{
  sessionId: string
}>

export function ActiveGameProvider({ sessionId, children }: Props) {
  const [role, setRole] = useState<ActiveGameRole | null>(null)
  const [session, setSession] = useState<SessionStateMessage | null>(null)
  const [revealed, setRevealed] = useState<AnswersRevealed | null>(null)
  const [myAnswer, setMyAnswer] = useState<{
    questionId: string
    text: string
  } | null>(null)
  const [standings, setStandings] = useState<Winner[] | null>(null)
  const [endReason, setEndReason] = useState<SessionEndReason | null>(null)
  const [sendMessage, setSendMessage] = useState<SendMessage | null>(null)

  // A mounted session screen keeps reconnecting while it lives: a drop means the
  // socket reconnects and JOIN_SESSION restores the seat (BR-58, BR-59)
  const endedRef = useRef(false)

  useEffect(() => {
    let socket: WebSocket | null = null
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const connect = async () => {
      try {
        socket = await createSocket()
      } catch (error) {
        toast(`Could not connect to the game: ${getApiErrorMessage(error)}`)
        if (!cancelled) retryTimer = setTimeout(connect, RECONNECT_DELAY_MS)
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
        send({ type: 'JOIN_SESSION', payload: { sessionId } })
      }

      socket.onmessage = (event: MessageEvent<string>) => {
        const message = parseServerMessage(event.data)

        if (!message) return

        switch (message.type) {
          case 'FAULT':
            toast(message.payload.message)
            return
          case 'JOINED_SESSION':
            setRole(message.payload.role)
            return
          case 'SESSION_STATE':
            setSession(message.payload)
            // a new question clears the revealed answers and the stored own
            // answer of the previous one
            setRevealed((current) =>
              current && current.questionId !== message.payload.question?.id
                ? null
                : current,
            )
            setMyAnswer((current) =>
              current && current.questionId !== message.payload.question?.id
                ? null
                : current,
            )
            return
          case 'ANSWER_ACCEPTED':
            setMyAnswer({
              questionId: message.payload.questionId,
              text: message.payload.text,
            })
            return
          case 'QUESTION_CLOSED':
            return
          case 'ANSWERS_REVEALED':
            setRevealed(message.payload)
            return
          case 'WINNERS':
            setStandings(message.payload.standings)
            return
          case 'SESSION_ENDED':
            endedRef.current = true
            setEndReason(message.payload.reason)
            return
        }
      }

      socket.onclose = () => {
        setSendMessage(null)
        if (!cancelled && !endedRef.current) {
          retryTimer = setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      if (socket) {
        socket.onopen = null
        socket.onmessage = null
        socket.onclose = null
        socket.close()
      }
      setSendMessage(null)
    }
  }, [sessionId])

  return (
    <ActiveGameContext.Provider
      value={{
        endReason,
        myAnswer,
        revealed,
        role,
        sendMessage,
        session,
        standings,
      }}
    >
      {children}
    </ActiveGameContext.Provider>
  )
}
