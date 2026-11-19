import { playwright } from '@vitest/browser-playwright'
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    // Dependencies Vite finds mid-run trigger a re-optimisation and a browser reload that breaks
    // the running specs (two React copies, lost mocks): list every runtime dependency here
    optimizeDeps: {
      include: [
        'react',
        'react/jsx-dev-runtime',
        'react-dom',
        'react-dom/client',
        'react-router',
        'react-hook-form',
        'react-toastify',
        '@tanstack/react-query',
        'axios',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        '@radix-ui/react-label',
        '@radix-ui/react-slot',
        'vitest-browser-react',
      ],
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['src/**/*.unit.spec.ts'],
            environment: 'happy-dom',
            mockReset: true,
            restoreMocks: true,
          },
        },
        {
          extends: true,
          test: {
            name: 'browser',
            include: ['src/**/*.browser.spec.tsx'],
            setupFiles: ['./vitest.browser.setup.ts'],
            mockReset: true,
            restoreMocks: true,
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
            },
          },
        },
      ],
    },
  }),
)
