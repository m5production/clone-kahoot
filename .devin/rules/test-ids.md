---
description: When to add data-testid and how to name it. Apply when adding test ids or writing component/e2e tests.
trigger: model_decision
---

# data-testid

## When

- **E2E flows** (`testing.md` → Scenarios): every interactive element, every form field, the
  "screen is ready" marker of each step and the scope containers to reach them — required even if
  the element has a good accessible name.
- Component tests: only when `getByRole` / `getByLabelText` / `getByText` can't give a stable handle.
- Never "just in case", never to encode state (assert `aria-*`, `disabled`, text instead),
  never use `aria-label` as a test id.

## Format

`^[a-z0-9]+(-[a-z0-9]+)*$`, structure `<scope>-<element>-<kind>`.

Kinds: `-button`, `-link`, `-tab`, `-tabs`, `-trigger`/`-content`, `-dialog`, `-form`, `-item`,
`-row`, `-card`, `-bar`, `-input`, `-empty`, `-unavailable`. No synonyms (`btn`, `wrapper`), no
copy text, no styling words, no random values.

## Uniqueness by scope

- Scope containers are unique on screen; list items end with the domain id:
  `game-card-<gameId>`, `question-card-<questionId>`, `player-row-<playerId>`.
- Inner elements are unique within their scope only: `delete-button`, `edit-button`.
- Portals (dialogs, toasts) get their own scope id.
- The static prefix must not start another id (`game-card-` vs `game-card-header` ❌).

```ts
await page.getByTestId(`question-card-${id}`).getByTestId("delete-button").click();
```

## Ids in the app (registry)

Keep this list in sync with `src/` — add/rename/remove rows in the same change.

| Screen | Ids |
|---|---|
| Welcome (`pages/welcome`) | `welcome-login-link`, `welcome-register-link` |
| Login (`pages/login`, `features/session/login`) | `login-form`, `login-name-input`, `login-password-input`, `login-submit-button`, `login-register-link`, `login-welcome-link` |
| Register (`pages/register`, `features/session/register`) | `register-form`, `register-name-input`, `register-password-input`, `register-submit-button`, `register-login-link`, `register-welcome-link` |
| Home (`pages/home` + features) | `user-avatar`, `logout-button`, `join-game-form`, `join-game-input`, `join-game-submit-button`, `create-game-form` → `create-game-title-input`, `create-game-button`, `games-list` → `game-item-<gameId>` → `game-link`, `delete-button` → `confirm-delete-button`/`cancel-delete-button`, `games-empty` |
| Quiz editor (`pages/quiz-editor` + features) | `home-link`, `game-title-button`, `rename-game-form` → `game-title-input`, `game-title-save-button`, `game-title-cancel-button`, `start-session-button`/`start-game-button`, `questions-sidebar`, `add-question-button`, `questions-list` → `question-item-<questionId>` (`aria-selected`, `aria-label="incomplete"` icon) → `move-up-button`, `move-down-button`, `question-form` → `question-image-input`, `question-text-input`, `question-time-limit-select`, `accepted-answers-list` → `accepted-answer-item-<index>` → `accepted-answer-input`, `remove-answer-button`; `add-answer-button`, `save-question-button`; `delete-question-button`; mobile (<768px): `editor-nav-bar` → `questions-tab` (incomplete-count badge), `question-tab` |
| Session (`pages/session`, `features/active-game/*`) | `session-unavailable`, `session-ended-reason`, `question-progress` → `question-progress-text`, `answers-progress`, `question-timer`; `invite-open-button` (host, <768px) → `invite-dialog` → `invite-link` → `invite-link-qr`, `copy-game-link-button`; `players-toggle-button` (host, <768px); `host-controls` → `start-game-button`, `close-question-button`, `show-answers-button`, `next-question-button`, `show-winners-button`, `end-session-button`, `home-link`; `answer-input`, `submit-answer-button`; `start-session-button` (quiz editor) |
| Shared game UI (entities) | `question-view`, `players-panel` → `players-list` → `player-item-<playerId>`, `player-answers-list` → `player-answer-item-<playerId>`, `winners-table` → `winner-row-<playerId>`, `accepted-answers` |
| History (`pages/history`, `pages/session-report`) | `history-link`, `game-history-link-<gameId>`, `all-history-link`, `history-list` → `history-item-<sessionId>`, `history-empty`, `back-to-history-link`, `report-unavailable`, `report-question-<id>` → `report-answer-<questionId>-<userId>`, `delete-session-button` → `confirm-delete-session-button`, `cancel-delete-session-button` |

`question-form` has `aria-busy="true"` until the selected question is loaded into it — wait for
`aria-busy="false"` before typing, loading resets the form. A question without accepted answers
(e.g. a new one) shows one empty `accepted-answer-item-0`.

Pass ids through components as a `data-testid` prop. On rename/removal update all specs in the same change.
