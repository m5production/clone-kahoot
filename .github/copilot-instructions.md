# Copilot instructions for clone-kahoot frontend

React 19 SPA (Vite, TypeScript, Tailwind v4, shadcn/Radix, TanStack Query, react-router, axios, native WebSocket).
Package manager: **bun** (not npm). Deployed to GitHub Pages via `bun run deploy`.

`AGENTS.md` has the full command list; `.devin/rules/` holds the conventions
(`fsd-architecture.md`, `code-style.md`, `testing.md`, `test-ids.md`) — they are the source of truth.

## Quick run

- Install: `bun install`
- Dev server: `bun run dev` (Vite on :5173; needs the backend from the sibling repo `../backend` on `http://localhost:3000` — its CORS allows only :5173)
- Verify changes: `bun run check` (Biome lint + circular-import check + `tsc -b` + Vitest). Run `bun run test:e2e` too when UI flows change.

## Big picture

`src/` follows Feature-Sliced Design — imports go **downward only**:
`app → pages → widgets → features → entities → shared`, enforced by Biome
`noRestrictedImports` (`bun run lint`) and dpdm (`bun run lint:circular`).

- `src/app/` — bootstrap, router (`app/router/app-router.tsx`), providers, global styles
- `src/pages/` — route screens: welcome, login, register, home, quiz-editor, session, session-report, history
- `src/features/` — user actions as `features/<domain>/<action>` (e.g. `features/question/create-question`, `features/active-game/control-game`)
- `src/entities/` — domain slices (game, question, answer-option, accepted-answer, player, user, session, active-game, history); `entities/active-game` holds the WebSocket connection and live game state via `ActiveGameProvider`
- `src/shared/` — HTTP/WS clients, env config (`shared/config/env.ts`), UI primitives, test helpers

## Conventions

- Every slice has an `index.ts` public API — import through it (`@/entities/game`), never internal files. Use `@/` across slices, relative `./` inside a slice (no `../` across slices).
- File naming: kebab-case + dot suffix — `x.api.ts` (backend calls), `x.queries.ts` (TanStack Query objects), `x.mutation.ts` (`useXMutation` hooks), `x.lib.ts` (pure functions), `x.ui.tsx` (JSX). Keep React thin: logic goes to `*.lib.ts`.
- Data fetching goes through TanStack Query query objects and mutation hooks, not ad-hoc `useEffect` + axios.
- Auth: opaque session token + user id in localStorage, sent as `Authorization: Bearer` (no cookies) — `entities/session`, `shared/api`. Read the session via its API, never `localStorage` directly.
- API/WS hosts come from `.env.development` / `.env.production` / `.env.test` (`VITE_API_URL`, `VITE_WS_URL`).

## Tests

Three tiers, all run in CI (`.github/workflows/ci.yml`):

- unit — `*.unit.spec.ts` next to the code (Vitest + happy-dom)
- component — `*.browser.spec.tsx` (Vitest browser mode, Playwright provider)
- e2e — `e2e/**/*.e2e.ts` (`@playwright/test` against the real backend, live-game specs in `e2e/live-game/`)

Commands: `bun run test`, `test:unit`, `test:browser`, `test:e2e`, `test:e2e:ui`, `test:all`.
Locate elements by `data-testid` per `.devin/rules/test-ids.md`.

## What NOT to change without discussion

- The stack: react-router, Biome, React Context/TanStack Query. No TanStack Router, Jotai, ESLint/Prettier, Storybook, MSW, Sentry or i18n without an explicit decision.
- Public APIs of shared slices (`shared/api`, `entities/active-game`) — changes ripple across host, player and winners screens.
- `vitest.browser.setup.ts` must not import modules that specs mock (see `.devin/rules/testing.md`).
