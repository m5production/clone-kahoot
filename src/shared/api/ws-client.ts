import { WS_URL } from '@/shared/config'

let socket: WebSocket | null = null

export const getSocket = () => {
  if (!socket) {
    socket = new WebSocket(WS_URL)
  }

  return socket
}
