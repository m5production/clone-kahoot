const requireEnv = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const API_URL = requireEnv(import.meta.env.VITE_API_URL, 'VITE_API_URL')
export const WS_URL = requireEnv(import.meta.env.VITE_WS_URL, 'VITE_WS_URL')
