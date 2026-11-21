---
description: Test tiers (unit, component, e2e), where each test goes and how to write stable tests. Apply when writing, changing or debugging tests.
trigger: model_decision
---

# Testing

Test at the lowest tier that gives confidence. All three tiers also run in CI
(`.github/workflows/ci.yml`: lint, dpdm, build, Vitest, e2e against a Postgres service).

| Tier | Files | Runner | What |
|---|---|---|---|
| Unit | `*.unit.spec.ts` next to the code | Vitest project `unit`, happy-dom | pure functions: `*.lib.ts`, `*.service.ts`, `*.queries.ts`, shared utils, WS message parsing, scoring |
| Component | `*.browser.spec.tsx` next to the code | Vitest project `browser` (browser mode, Playwright provider, Chromium) | UI of entities/features/widgets and `shared/ui`, API mocked |
| E2E | `e2e/**/*.e2e.ts` | `@playwright/test` against the real backend | user scenarios across pages |

Pages get no unit/component specs — they are covered by e2e.

Commands: `bun run test` (unit + component), `test:unit`, `test:browser`, `test:watch`,
`test:e2e`, `test:e2e:ui`, `test:all`. Config: `vitest.config.ts`, `playwright.config.ts`.

## Unit and component

- Test data: `entities/player/player.fixtures.ts` (`createPlayer`, `createAnswer`),
  `createActiveGameState()` from `@/entities/active-game` (provide it via `ActiveGameContext.Provider`).
- Render with `render` from `vitest-browser-react`, or `renderWithProviders` from `@/shared/test`
  when the UI needs TanStack Query / the router; it shows the current path in `test-location`.
- No real network: mock the API at the slice boundary. Partial mock keeps the queries working:
  `vi.mock('@/entities/question', async (importOriginal) => ({ ...(await importOriginal()), updateQuestion: vi.fn() }))`.
  Or seed `queryClient.setQueryData(X_QUERY.queryKey(id), data)` — the browser setup sets
  `staleTime: Infinity`, so seeded data is not refetched.
- `vitest.browser.setup.ts` must not import modules that specs mock (e.g. the `@/shared/api` barrel
  pulls in `react-toastify`): browser mode can't mock a module that is already loaded.
- A dependency found mid-run reloads the browser and breaks the run (two Reacts, lost mocks): add
  every new runtime dependency to `optimizeDeps.include` in `vitest.config.ts`.
- Mocks are reset between tests (`mockReset`/`restoreMocks`); the setup file clears the query cache
  and localStorage after each test.
- Wait for conditions (`expect.element`, `expect.poll`, `vi.waitFor`), never `setTimeout` before a
  positive check. A fixed wait only proves something does *not* happen and is a named constant.
- `await` every `render`, `userEvent`, locator action and `expect.element`.
- Fail loudly: no `querySelector(...)?.click()`.
- Slow step → explicit `{ timeout }` from a named constant; never raise global timeouts or add retries.
- Prefer accessible queries (`getByRole`, `getByLabelText`, `getByText`), then `getByTestId`.
- No snapshot tests.

## E2E (real backend)

- Prerequisites: `../backend` with installed deps (`npx yarn@1.22.22 install --frozen-lockfile`) and
  `bunx playwright install chromium` (Playwright >= 1.65 on Ubuntu 26.04).
- `playwright.config.ts` `webServer` starts the backend on :3101 with a fresh
  PostgreSQL database (`prisma migrate reset` on every run against
  `postgres:postgres@localhost:5432/clone_kahoot_e2e`, overridable via `E2E_DB_*`)
  and Vite on :5174 with `VITE_API_URL`/`VITE_WS_URL` pointing to it — so it
  doesn't clash with the dev servers.
  Ports: `e2e/support/urls.ts`. Reports, traces, screenshots: `e2e/.tmp/` (gitignored).
- Fixtures (`e2e/support/fixtures.ts`, import `test`/`expect` from there):
  - `api` — create users, games, questions with accepted answers via the backend API;
  - `uniqueName(prefix)` — user names are unique in the backend;
  - `signIn(prefix)` — a new user in its **own browser context** (session token + remembered user id),
    returns `{ user, page }`; use one per actor (host, each player).
- Set test data up through `api`, not the UI; the UI flow itself is tested once in its own spec.
- Live-game specs live in `e2e/live-game/` and run in the separate `live-game`
  project. The backend supports concurrent game rooms, but specs still share one
  backend instance — each spec creates its own game and players via `api`.
- The question editor resets when the selected question loads: wait for
  `question-form` `aria-busy="false"` before typing. A new question shows one empty answer field.
- Each game screen (`ActiveGameProvider`) opens its own WebSocket and closes it on unmount; the
  backend ends the game when the host's socket closes (leaving the host page ends the game).
- Locate elements by `data-testid` (see `test-ids.md`), scoped by container; check texts only where
  the text is the requirement. Web-first assertions only, no `waitForTimeout`.

## Covered scenarios

1. Auth (`e2e/auth.e2e.ts`): welcome page, register via `/register`, log in via `/login`,
   wrong credentials (no account created), taken nickname (incl. different case),
   required fields, remembered user → `/home`, guest → welcome, logout.
2. Games (`e2e/games.e2e.ts`): create with title → editor → listed on home; only own games
   listed, newest first; rename in editor; delete with confirmation (cascade).
3. Questions (`e2e/questions.e2e.ts`): create with image and answers, edit, validation
   (incl. duplicate answers), delete; persisted after reload; reorder via up/down buttons;
   start blocked until every question is ready (FR-55).
4. Live game (`e2e/live-game/live-game.e2e.ts`): host + two players, answers shown, question switch,
   answers kept when going back, winners order on all screens, stop game; join errors (not running,
   another game running, empty link).
5. History (`e2e/history.e2e.ts`): a finished game appears in the history and the report shows its
   answers; an aborted session is recorded as aborted; deleting the quiz keeps its history (BR-81);
   another host cannot see or delete the record (BR-81); the host deletes a record after
   confirming (FR-82).
6. Quiz editor on mobile (`e2e/quiz-editor-mobile.e2e.ts`): bottom nav switches between the
   question list and the editor; adding a question opens the Question tab, deleting returns to the
   list; an unready quiz counts incomplete questions and the FAB explains why it cannot start; a
   ready quiz starts from the FAB and opens the lobby.
7. Live game extras (`e2e/live-game/`): choice questions — the host builds a choice question, the
   player answers by button, the report shows the picks (`choice-question.e2e.ts`); the host runs
   the whole game from a phone and ends the session from the bottom bar with a confirmation
   (`host-mobile.e2e.ts`).
