import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'
import { E2E_API_URL, E2E_APP_URL, E2E_BACKEND_PORT, E2E_WS_URL } from './e2e/support/urls'

const BACKEND_DIR = path.resolve(import.meta.dirname, '../backend')
// The test database lives outside the backend repo, so runs never touch its working tree
const E2E_TMP_DIR = path.resolve(import.meta.dirname, 'e2e/.tmp')
const E2E_DATABASE_URL = `file:${E2E_TMP_DIR}/e2e.db`

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  outputDir: `${E2E_TMP_DIR}/test-results`,
  fullyParallel: true,
  forbidOnly: true,
  reporter: [['list'], ['html', { outputFolder: `${E2E_TMP_DIR}/report`, open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: E2E_APP_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'e2e',
      testIgnore: '**/live-game/**',
    },
    {
      // The backend keeps a single global active game: live-game specs must not overlap
      name: 'live-game',
      testMatch: '**/live-game/**/*.e2e.ts',
      workers: 1,
      fullyParallel: false,
    },
  ],
  webServer: [
    {
      name: 'backend',
      cwd: BACKEND_DIR,
      // A fresh database on every run
      command: `mkdir -p "${E2E_TMP_DIR}" && npx prisma migrate reset --force --skip-seed --skip-generate && npx ts-node src/server.ts`,
      url: `${E2E_API_URL}/users/auth/healthcheck`,
      env: {
        PORT: String(E2E_BACKEND_PORT),
        HOST: 'http://localhost',
        NODE_ENV: 'test',
        DATABASE_URL: E2E_DATABASE_URL,
        ALLOWED_ORIGIN: E2E_APP_URL,
      },
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      name: 'frontend',
      command: `bun run dev --port ${new URL(E2E_APP_URL).port} --strictPort`,
      url: E2E_APP_URL,
      env: { VITE_API_URL: E2E_API_URL, VITE_WS_URL: E2E_WS_URL },
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})
