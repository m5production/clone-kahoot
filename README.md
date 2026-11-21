# piggies quiz

A real-time quiz game inspired by Kahoot: a host builds a quiz and runs it live, players join from their devices, answer questions and see the winners table at the end.

**[Live demo](https://m5production.github.io/clone-kahoot/)** · **[Backend repository](https://github.com/m5production/clone-kahoot-backend)**

![piggies quiz screenshot](https://github.com/user-attachments/assets/779f7d60-530c-487a-9875-cbadeec15e46)

## Features

- Sign-in and protected routes
- Game list and game creation
- Quiz builder for the host: create, edit, reorder and delete questions — open-ended (with accepted answers) or multiple choice — plus a per-question time limit
- Live game run by the host, with players connected in real time over WebSocket; players join via a shared link or QR code
- Player view for answering questions
- Winners table
- Game history: past sessions with a full answer report per game
- Mobile-friendly: the host can run the whole game from a phone, and the quiz editor works on small screens

## Tech stack

**Frontend (this repo):** React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Axios, Tailwind CSS, shadcn/ui, React Toastify — Feature-Sliced Design, Biome

**Backend ([clone-kahoot-backend](https://github.com/m5production/clone-kahoot-backend)):** Node.js, NestJS (Express adapter), TypeScript, WebSocket (`ws`), Prisma ORM, PostgreSQL, Docker, deployed on Amvera

**Tests:** Vitest (unit + browser mode) and Playwright e2e against the real backend

## Architecture

```
React SPA (GitHub Pages)
   │  REST (Axios + TanStack Query)   ─┐
   │  WebSocket (live game events)    ─┤
   ▼                                    ▼
NestJS API + ws server (Docker, Amvera)
   │
   ▼
Prisma ORM → PostgreSQL
```

`src/` follows Feature-Sliced Design:

- `src/app/` — application setup: router, styles
- `src/pages/` — route screens (welcome, login, register, home, quiz-editor, session, session-report, history)
- `src/features/` — user actions (start-session, control-game, submit-answer, session, game/question/history management)
- `src/entities/` — domain models (`Game`, `Question`, `Player`, ...) and `ActiveGameProvider`, which holds the WebSocket connection and live game state
- `src/shared/` — HTTP/WS clients, env config, UI primitives, test helpers

## Running locally

1. Start the [backend](https://github.com/m5production/clone-kahoot-backend) on `http://localhost:3000`.
2. Install dependencies and start the dev server:

```bash
bun install
bun run dev
```

API/WS hosts come from `.env.development` / `.env.production` (`VITE_API_URL`, `VITE_WS_URL`, read in `src/shared/config/env.ts`); in development the app talks to `http://localhost:3000`.

| Script | Description |
|---|---|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Type-check and build for production |
| `bun run lint` | Run Biome (lint + format check); `bun run lint:fix` applies fixes |
| `bun run lint:circular` | Fail on circular imports (dpdm) |
| `bun run test` | Run unit + component tests (Vitest); `test:unit` / `test:browser` run a single tier |
| `bun run test:e2e` | Run Playwright e2e tests against the real backend (`test:e2e:ui` for UI mode) |
| `bun run test:all` | Run Vitest and Playwright |
| `bun run check` | lint + lint:circular + build + tests — run before committing |
| `bun run preview` | Preview the production build |
| `bun run deploy` | Publish `dist` to GitHub Pages |
