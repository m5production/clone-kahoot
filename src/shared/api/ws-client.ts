import { WS_URL } from '@/shared/config'
import { httpClient } from './http-client'

const wsUrl = (path: string) => {
  const url = new URL(path, WS_URL)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'

  return url
}

export const createSocket = async (): Promise<WebSocket> => {
  const { data } = await httpClient.post<{ ticket: string }>('/auth/ws-ticket')

  const url = wsUrl('/ws')
  url.searchParams.set('ticket', data.ticket)

  return new WebSocket(url)
}
