---
description: Test tiers (unit, component, e2e), where each test goes and how to write stable tests. Apply when writing, changing or debugging tests.
trigger: model_decision
---

# Testing

Test at the lowest tier that gives confidence. All three tiers run **locally** (no CI yet).

| Tier | Files | Runner | What |
|---|---|---|---|
| Unit | `*.unit.spec.ts` next to the code | Vitest, happy-dom | pure functions: `*.lib.ts`, `*.mappers.ts`, `*.schema.ts`, shared utils, WS message parsing, scoring |
| Component | `*.browser.spec.tsx` next to the code | Vitest browser mode, Playwright provider (Chromium) | UI of entities/features/widgets and `shared/ui`, API mocked |
| E2E | `e2e/**/*.e2e.ts` | `@playwright/test` against the real backend | user scenarios across pages |

Pages get no unit/component specs — they are covered by e2e.

## Unit and component

- No real network: mock the slice API module (`vi.mock("@/entities/game/game.api")`) or seed
  `queryClient.setQueryData`.
- Wait for conditions (`expect.element`, `expect.poll`, `vi.waitFor`), never `setTimeout` before a
  positive check. A fixed wait only proves something does *not* happen and is a named constant.
- `await` every `render`, `userEvent`, locator action and `expect.element`.
- Fail loudly: no `querySelector(...)?.click()`.
- Slow step → explicit `{ timeout }` from a named constant; never raise global timeouts or add retries.
- Reset in `afterEach`: query cache, mocks, URL/history, localStorage/cookies, WS mock.
- Prefer accessible queries (`getByRole`, `getByLabelText`, `getByText`), then `getByTestId`.
- No snapshot tests.

## E2E (real backend)

- `playwright.config.ts` `webServer` starts `../backend` with a dedicated test env (own SQLite file,
  `prisma migrate deploy` + seed before the run) and the Vite dev server.
- Each test creates its own data via API fixtures with unique names (`host-<uuid>`); no test depends
  on another test's data.
- Log in via API and reuse `storageState`; the UI login is tested once in its own spec.
- The backend keeps **one global active game** → live-game specs run serially in a separate
  Playwright project (`workers: 1`); other specs may run in parallel.
- Multiplayer: one test opens separate browser contexts for the host and each player.
- Locate elements by `data-testid` (see `test-ids.md`); check texts only where the text is the requirement.
- Same stability rules as above: web-first assertions (`await expect(locator).toBeVisible()`), no `waitForTimeout`.

## Scenarios to cover

1. Auth: sign up / log in → `/home`; wrong password → error; no cookie → redirect to `/`.
2. Games: create a game → it appears in the list → open the editor.
3. Questions: create (with image and accepted answers), edit, delete; persisted after reload.
4. Live game: host starts, two players join and are listed, answer right/wrong, host advances,
   players see winners in the correct order.
5. Errors: joining a non-existent or not started game.
