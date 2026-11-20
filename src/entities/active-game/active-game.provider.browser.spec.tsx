import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { createSocket } from '@/shared/api'
import { useActiveGame } from './active-game.context'
import { createSessionState } from './active-game.fixtures'
import { ActiveGameProvider } from './active-game.provider'
import type { ServerMessage } from './active-game.types'

vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  createSocket: vi.fn(),
}))

class FakeSocket {
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent<string>) => void) | null = null
  onclose: (() => void) | null = null
  send = vi.fn()
  close = vi.fn()

  open() {
    this.onopen?.()
  }

  receive(message: ServerMessage) {
    this.onmessage?.(
      new MessageEvent('message', { data: JSON.stringify(message) }),
    )
  }

  sentMessages() {
    return this.send.mock.calls.map(([data]) => JSON.parse(data))
  }
}

const sockets: FakeSocket[] = []

const useFakeSockets = () => {
  sockets.length = 0
  vi.mocked(createSocket).mockImplementation(async () => {
    const socket = new FakeSocket()
    sockets.push(socket)
    // The provider only uses the members FakeSocket implements
    return socket as unknown as WebSocket
  })
}

const lastSocket = () => {
  const socket = sockets.at(-1)
  if (!socket) throw new Error('no socket was created')
  return socket
}

function SessionProbe() {
  const { role, session, standings, endReason } = useActiveGame()

  const probe = [
    role ?? 'no role',
    session?.question?.text ?? 'no question',
    `${session?.players.length ?? 0} players`,
    `${standings?.length ?? 'no'} winners`,
    endReason ?? 'running',
  ].join('|')

  return <p data-testid="probe">{probe}</p>
}

const renderProvider = () =>
  render(
    <ActiveGameProvider sessionId="s1">
      <SessionProbe />
    </ActiveGameProvider>,
  )

const join = (socket: FakeSocket) => {
  socket.open()
  socket.receive({
    type: 'JOINED_SESSION',
    payload: { role: 'player', sessionId: 's1' },
  })
}

describe('ActiveGameProvider', () => {
  it('joins the session once connected and shows the session state', async () => {
    useFakeSockets()
    const screen = await renderProvider()
    const socket = lastSocket()

    socket.open()
    expect(socket.sentMessages()).toEqual([
      { type: 'JOIN_SESSION', payload: { sessionId: 's1' } },
    ])

    join(socket)
    socket.receive({
      type: 'SESSION_STATE',
      payload: createSessionState({
        players: [
          {
            id: 'u1',
            name: 'alice',
            bgColor: '#000',
            connected: true,
            answered: false,
          },
        ],
      }),
    })

    await expect
      .element(screen.getByTestId('probe'))
      .toHaveTextContent('player|2+2?|1 players|no winners|running')
  })

  it('keeps the winners and the end reason', async () => {
    useFakeSockets()
    const screen = await renderProvider()
    const socket = lastSocket()
    join(socket)

    socket.receive({
      type: 'WINNERS',
      payload: { standings: [{ id: 'u1', name: 'alice', score: 2 }] },
    })
    socket.receive({
      type: 'SESSION_ENDED',
      payload: { reason: 'finished' },
    })

    await expect
      .element(screen.getByTestId('probe'))
      .toHaveTextContent('player|no question|0 players|1 winners|finished')
  })

  it('closes its connection on unmount and joins again on the next mount', async () => {
    useFakeSockets()
    const first = await renderProvider()
    const firstSocket = lastSocket()
    firstSocket.open()

    await first.unmount()
    expect(firstSocket.close).toHaveBeenCalled()

    await renderProvider()
    const secondSocket = lastSocket()
    if (secondSocket === firstSocket) throw new Error('no new socket was made')

    secondSocket.open()
    expect(secondSocket.sentMessages()).toEqual([
      { type: 'JOIN_SESSION', payload: { sessionId: 's1' } },
    ])
  })

  it('reconnects after a drop and rejoins the session', async () => {
    useFakeSockets()
    await renderProvider()
    const firstSocket = lastSocket()
    join(firstSocket)

    firstSocket.onclose?.()

    await expect.poll(() => sockets.length, { timeout: 4000 }).toBe(2)
    const secondSocket = lastSocket()
    secondSocket.open()
    expect(secondSocket.sentMessages()).toEqual([
      { type: 'JOIN_SESSION', payload: { sessionId: 's1' } },
    ])
  })
})
