// Own ports, so e2e runs don't clash with the dev servers (5173 / 3000)
export const E2E_BACKEND_PORT = 3101
export const E2E_APP_URL = 'http://localhost:5174'
export const E2E_API_URL = `http://localhost:${E2E_BACKEND_PORT}/api`
export const E2E_WS_URL = `http://localhost:${E2E_BACKEND_PORT}/`
