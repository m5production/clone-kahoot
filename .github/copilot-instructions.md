# Copilot instructions for clone-kahoot

Purpose
- Help AI coding agents get productive quickly in this codebase: a Vite + React + TypeScript single-page app for quiz/game functionality.

Quick run (developer machine)
- Install: `npm install`
- Dev server: `npm run dev` (uses Vite from `package.json`)
- Build: `npm run build`
- Preview build: `npm run preview`

Big picture
- Frontend-only client app built with Vite + React + TypeScript. Key entry: `src/main.tsx`.
- Routing and feature pages live under `src/pages/` (each feature is a folder, e.g. `MainWindow`, `AdminQuizReview`, `Player`).
- UI primitives live in `src/components/ui/` (small single-responsibility components such as `button.tsx`, `input.tsx`, `card.tsx`).
- Data-fetching hooks are colocated inside page folders at `src/pages/*/api/` and follow the `useXxx` naming pattern (examples: `useGetGames.ts`, `usePostAddNewGame.ts`).
- Shared client hooks and utilities live in `src/lib/` (examples: `useActiveGame.ts`, `useGetAllQuestions.ts`, `utils.ts`).
- Type models are in `src/types/` (use these types to shape API responses and component props).
- Small context providers exist (e.g. `src/components/ui/ActiveGameProvider.tsx`) for cross-tree state.

Project conventions and patterns (explicit)
- Feature folders: a page folder contains the UI, and an `api/` subfolder for hooks that interact with backend endpoints. When adding new endpoints, add hooks under the corresponding page `api/` folder.
- Hook naming: asynchronous data hooks are named `useGetXxx`, `usePostXxx`, `usePutXxx`, `usePatchXxx`, `useDeleteXxx` (check `src/pages/*/api/` for examples). Prefer these conventions for discoverability.
- UI primitives: add small, composable components under `src/components/ui/`. Keep them presentation-only where possible; pass callbacks props for behavior.
- Types: put new types into `src/types/` and import them across hooks and components. Reuse existing types such as `Question`, `Player`, `ActiveGame`.
- Styling: global and per-app CSS files exist (`src/index.css`, `src/App.css`). Small components use className strings — keep styles minimal and predictable.

Data flow and integration points
- The app relies on data hooks under `pages/*/api` to talk to a backend. Inspect `src/pages/MainWindow/api/useGetGames.ts` and `src/pages/AdminQuizReview/api/useGetSingleQuestion.ts` as canonical examples.
- Local state vs server: long-lived state shared across many components uses providers (see `ActiveGameProvider.tsx`) or custom hooks in `src/lib/`.
- When adding a new feature, add API hook(s) in the feature folder, update types in `src/types/`, and wire the UI under `src/pages/<Feature>`.

Files to open first when modifying behavior
- `src/main.tsx` — app bootstrap and providers
- `src/Router.tsx` — route mapping and auth-protected routes
- `src/pages/*/index.tsx` — feature entry points
- `src/pages/*/api/*` — data access hooks
- `src/components/ui/` — shared components and providers
- `src/lib/` — shared hooks and utilities

Developer workflow notes (discovered)
- No test suite was found in the repo root; assume manual verification via `npm run dev` and the browser.
- Linting / formatting: check `package.json` for scripts; if none, follow typical `npm run` tasks added by Vite templates.

Examples (concrete)
- Adding a GET hook for games: mimic `src/pages/MainWindow/api/useGetGames.ts` — export a `useGetGames` hook that returns fetched data and loading state.
- New page structure:
  - `src/pages/NewFeature/index.tsx` — presentational and container components
  - `src/pages/NewFeature/api/useGetSomething.ts` — data fetching hook
  - Add routes in `src/Router.tsx`.

What NOT to change without PR-level discussion
- App-wide providers and bootstrap in `src/main.tsx` (they influence all pages).
- Type definitions in `src/types/` that are shared by multiple pages — changing those is breaking.

Where to look for undocumented behavior
- `managed_context/metadata.json` — contains metadata used by the project; check before changing runtime assumptions.

If you are an AI assistant making changes
- Follow existing naming conventions (`useXxx`, `pages/*/api`), reuse types from `src/types/`, and run the dev server locally to verify UI behavior.
- Keep PRs small and focused: change the type, hook, and consumer together in the same PR when feasible.

Feedback
- If anything here is unclear or missing (CI, special environment variables, or backend URL conventions), tell me which area to expand and I'll iterate.
