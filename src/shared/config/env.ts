const DEV_API_URL = 'http://localhost:3000/api'
const PROD_API_URL = 'https://piggies-quiz-m5production.amvera.io/api'
const DEV_WS_URL = 'http://localhost:3000/'
const PROD_WS_URL = 'https://piggies-quiz-m5production.amvera.io/'

export const API_URL: string =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? PROD_API_URL : DEV_API_URL)

export const WS_URL: string =
  import.meta.env.VITE_WS_URL ?? (import.meta.env.PROD ? PROD_WS_URL : DEV_WS_URL)
