# Clone-Kahoot

A real-time quiz game inspired by Kahoot: a host builds a quiz and runs it live, players join from their devices, answer questions and see the winners table at the end.

**[Live demo](https://dimetriyo.github.io/clone-kahoot/)** · **[Backend repository](https://github.com/m5production/clone-kahoot-backend)**

![Clone-Kahoot screenshot](https://github.com/user-attachments/assets/779f7d60-530c-487a-9875-cbadeec15e46)

## Features

- Sign-in and protected routes
- Game list and game creation
- Quiz builder for the host: create, edit and delete questions and their accepted answers
- Live game run by the host, with players connected in real time over WebSocket
- Player view for answering questions
- Winners table

## Tech stack

**Frontend (this repo):** React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Axios, Tailwind CSS, shadcn/ui, React Toastify

**Backend ([clone-kahoot-backend](https://github.com/m5production/clone-kahoot-backend)):** Node.js, Express, TypeScript, WebSocket (`ws`), Prisma ORM, SQLite, Docker, deployed on Amvera

## Architecture

```
React SPA (GitHub Pages)
   │  REST (Axios + TanStack Query)   ─┐
   │  WebSocket (live game events)    ─┤
   ▼                                    ▼
Node.js + Express API + ws server (Docker, Amvera)
   │
   ▼
Prisma ORM → SQLite
```

- `src/pages/*` — feature pages; each keeps its API hooks in an `api/` subfolder (`useGetGames`, `usePostNewQuestion`, ...)
- `src/components/ui/` — UI primitives and `ActiveGameProvider`, which holds the WebSocket connection and live game state
- `src/types/` — shared domain types (`Game`, `Question`, `Player`, ...)

## Running locally

1. Start the [backend](https://github.com/m5production/clone-kahoot-backend) on `http://localhost:3000`.
2. Install dependencies and start the dev server:

```bash
bun install
bun run dev
```

In development the app talks to `http://localhost:3000`; production builds use the deployed backend (see `src/constants.ts`).

| Script | Description |
|---|---|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Type-check and build for production |
| `bun run lint` | Run Biome (lint + format check) |
| `bun run preview` | Preview the production build |
| `bun run deploy` | Publish `dist` to GitHub Pages |
