import { WS_URL } from '@/shared/config'

export const createSocket = () => new WebSocket(WS_URL)
