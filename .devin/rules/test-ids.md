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
| Login (`features/session/login`) | `login-form`, `login-name-input`, `login-password-input`, `login-submit-button` |
| Home (`pages/home` + features) | `user-avatar`, `logout-button`, `join-game-form`, `join-game-input`, `join-game-submit-button`, `create-game-button`, `games-list` → `game-item-<gameId>` → `game-link`, `games-empty` |
| Quiz editor (`pages/quiz-editor` + features) | `home-link`, `start-game-link`, `questions-sidebar`, `add-question-button`, `questions-list` → `question-item-<questionId>` (`aria-selected`), `question-form` → `question-image-input`, `question-text-input`, `accepted-answers-list` → `accepted-answer-item-<index>` → `accepted-answer-input`, `remove-answer-button`; `add-answer-button`, `save-question-button`; `delete-question-button` |
| Host game (`pages/host-game`, `features/active-game/control-game`) | `host-questions-list` → `host-question-item-<questionId>` → `switch-question-button` (`aria-current`); `host-controls` → `copy-game-link-button`, `show-answers-button`, `show-winners-button`, `stop-game-button`, `home-link` |
| Player game (`pages/player-game`, `features/active-game/submit-answer`) | `answer-input`, `submit-answer-button` |
| Shared game UI (entities) | `question-view`, `players-panel` → `players-list` → `player-item-<playerId>`, `player-answers-list` → `player-answer-item-<playerId>`, `winners-table` → `winner-row-<playerId>` |
| Winners (`pages/winners`) | `winners-table`, `home-link` |

A new question has no accepted answers: the form shows no `accepted-answer-item-*` until
`add-answer-button` is clicked. Wait for the form data to load before typing — it resets the form.

Pass ids through components as a `data-testid` prop. On rename/removal update all specs in the same change.
