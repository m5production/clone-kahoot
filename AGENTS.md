# clone-kahoot frontend

React 19 SPA (Vite, TypeScript, Tailwind v4, shadcn/Radix, TanStack Query, react-router, axios, native WebSocket).
Package manager: **bun**. Deployed to GitHub Pages (`bun run deploy`).

Backend lives in the sibling repo `../backend` (Express + WebSocket + Prisma/SQLite), product docs in `../docs`.

## Commands

- `bun run dev` — Vite dev server on :5173 (backend must run on `http://localhost:3000`; its CORS allows only `http://localhost:5173`)
- `bun run build` — `tsc -b && vite build`
- `bun run lint` — ESLint, including FSD import rules (layers, public API, no `../` across slices)
- `bun run lint:circular` — dpdm, fails on circular imports
- `bun run check` — lint + lint:circular + build; run before committing

Local backend for manual/e2e runs: in `../backend` — `npx yarn@1.22.22 install --frozen-lockfile`,
`npx dotenvx run -f .env.development -- npx prisma migrate deploy`, then `npm run dev`
(yarn is not installed globally; don't use `prisma-migrate-dev`, it creates new migrations).

API/WS hosts can be overridden with `VITE_API_URL` / `VITE_WS_URL` (see `src/shared/config/env.ts`).

## Architecture

`src/` follows **Feature-Sliced Design** — rules: `.devin/rules/fsd-architecture.md`.
Code style: `.devin/rules/code-style.md`.

## Tests (next step)

Three tiers, local only, no CI yet — rules: `.devin/rules/testing.md`, test ids: `.devin/rules/test-ids.md`:
- unit (Vitest, no browser),
- component (Vitest browser mode, Playwright provider),
- e2e (`@playwright/test` against the **real backend**).

Playwright **>= 1.65** is required on this machine (Ubuntu 26.04); 1.57 can't install Chromium here.

Keep the current stack (react-router, ESLint, React Context/TanStack Query). Do not introduce TanStack Router, Jotai, Biome, Storybook, MSW, Sentry or i18n without an explicit decision.
