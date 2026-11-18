import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { createSocket } from '@/shared/api'
import { useActiveGame } from './active-game.context'
import { ActiveGameProvider } from './active-game.provider'
import type { ActiveGame, ServerMessage } from './active-game.types'

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
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(message) }))
  }

  sentMessages() {
    return this.send.mock.calls.map(([data]) => JSON.parse(data))
  }
}

const sockets: FakeSocket[] = []

const useFakeSockets = () => {
  sockets.length = 0
  vi.mocked(createSocket).mockImplementation(() => {
    const socket = new FakeSocket()
    sockets.push(socket)
    // The provider only uses the members FakeSocket implements
    return socket as unknown as WebSocket
  })
}

const game: ActiveGame = {
  id: 'g1',
  players: [{ id: 'u1', name: 'alice', bgColor: '#000', answers: [] }],
  allQuestions: [{ id: 'q1', gameId: 'g1', text: '2+2?', img: null }],
  activeQuestionId: 'q1',
}

function GameProbe() {
  const { activeQuestion, players } = useActiveGame()

  return (
    <p data-testid="probe">
      {activeQuestion?.text ?? 'no question'} / {players.length} players
    </p>
  )
}

const renderProvider = (role: 'host' | 'player', onWinnersShown = vi.fn()) =>
  render(
    <ActiveGameProvider role={role} gameId="g1" userId="u1" onWinnersShown={onWinnersShown}>
      <GameProbe />
    </ActiveGameProvider>
  )

describe('ActiveGameProvider', () => {
  it('starts the game as the host once connected and shows the game data', async () => {
    useFakeSockets()
    const screen = await renderProvider('host')
    const socket = sockets.at(-1)
    if (!socket) throw new Error('no socket was created')

    socket.open()
    expect(socket.sentMessages()).toEqual([{ type: 'START_GAME', payload: { gameId: 'g1' } }])

    socket.receive({ type: 'GAME_DATA', payload: game })
    await expect.element(screen.getByTestId('probe')).toHaveTextContent('2+2? / 1 players')
  })

  it('connects a player and reports the winners', async () => {
    useFakeSockets()
    const onWinnersShown = vi.fn()
    await renderProvider('player', onWinnersShown)
    const socket = sockets.at(-1)
    if (!socket) throw new Error('no socket was created')

    socket.open()
    socket.receive({ type: 'SHOW_WINNERS', payload: null })

    expect(socket.sentMessages()).toEqual([
      { type: 'PLAYER_CONNECTED', payload: { userId: 'u1' } },
    ])
    expect(onWinnersShown).toHaveBeenCalledOnce()
  })

  it('closes its connection on unmount and joins again with a new one on the next mount', async () => {
    useFakeSockets()
    const first = await renderProvider('host')
    const firstSocket = sockets.at(-1)
    if (!firstSocket) throw new Error('no socket was created')
    firstSocket.open()

    await first.unmount()
    expect(firstSocket.close).toHaveBeenCalled()

    await renderProvider('host')
    const secondSocket = sockets.at(-1)
    if (!secondSocket || secondSocket === firstSocket) throw new Error('no new socket was created')

    secondSocket.open()
    expect(secondSocket.sentMessages()).toEqual([
      { type: 'START_GAME', payload: { gameId: 'g1' } },
    ])
  })
})
