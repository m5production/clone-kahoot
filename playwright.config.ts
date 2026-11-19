import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'
import { E2E_API_URL, E2E_APP_URL, E2E_BACKEND_PORT, E2E_WS_URL } from './e2e/support/urls'

const BACKEND_DIR = path.resolve(import.meta.dirname, '../backend')
const E2E_TMP_DIR = path.resolve(import.meta.dirname, 'e2e/.tmp')
// A dedicated PostgreSQL database for e2e runs; it is reset on every run
const E2E_DB = {
  DB_HOST: process.env.E2E_DB_HOST ?? 'localhost',
  DB_PORT: process.env.E2E_DB_PORT ?? '5432',
  DB_USER: process.env.E2E_DB_USER ?? 'postgres',
  DB_PASSWORD: process.env.E2E_DB_PASSWORD ?? 'postgres',
  DB_NAME: process.env.E2E_DB_NAME ?? 'clone_kahoot_e2e',
}

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
      // Live-game specs share one backend with in-memory rooms; each uses its own game
      name: 'live-game',
      testMatch: '**/live-game/**/*.e2e.ts',
    },
  ],
  webServer: [
    {
      name: 'backend',
      cwd: BACKEND_DIR,
      // A fresh database on every run
      command: `mkdir -p "${E2E_TMP_DIR}" && node scripts/prisma-env.mjs migrate reset --force --skip-seed --skip-generate && npx tsc && node dist/main.js`,
      url: `${E2E_API_URL}/health/live`,
      env: {
        PORT: String(E2E_BACKEND_PORT),
        HOST: '127.0.0.1',
        NODE_ENV: 'test',
        ...E2E_DB,
        ALLOWED_ORIGINS: E2E_APP_URL,
        TRUST_PROXY: 'false',
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
