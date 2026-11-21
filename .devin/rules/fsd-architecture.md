---
description: Feature-Sliced Design layers, dependency rules, public API and file naming for src/
trigger: glob
globs: src/**/*.ts,src/**/*.tsx
---

# Feature-Sliced Design

## Layers

```
src/
├── app/        # entry, providers (QueryClient, toasts), router + route guards, global styles
├── pages/      # route screens: login, home, quiz-editor, host-game, player-game, winners
├── widgets/    # only for compositions reused by 2+ pages
├── features/   # user actions: features/<domain>/<action>, e.g. features/question/create-question
├── entities/   # domain: game, question, accepted-answer, player, user, session, active-game
└── shared/     # api clients (http, ws), config (hosts, storage keys), ui primitives, lib/utils
```

## Dependency rules

Imports go **downward only**: `app → pages → widgets → features → entities → shared`.

- ❌ A feature importing another feature.
- ❌ entities → features/widgets/pages; shared → any business layer.
- Entity → entity cross-import only as a last resort, **one direction**, through `index.ts`, marked:
  `import { Player } from "@/entities/player"; // FSD: cross import`
- Widgets have no API files (API lives in entities/features).
- No import cycles.
- Inside a slice use relative `./` imports; across slices use `@/` (no `../`).

Enforced by `bun run lint` (`noRestrictedImports` per layer in `biome.json`) and
`bun run lint:circular` (dpdm). The one-way rule for entity cross-imports is checked by dpdm only.

## Public API

Every slice has `index.ts`; import only through it.

```ts
import { GAMES_QUERY, type Game } from "@/entities/game";       // ✅
import { fetchGames } from "@/entities/game/game.api";          // ❌ internal file
```

## File naming

kebab-case + dot suffix, flat inside the slice until it gets crowded (then `ui/`, `api/`, `model/` folders):

| File | Contents |
|---|---|
| `x.api.ts` / `x.api.types.ts` | backend calls via `shared/api` / raw API types |
| `x.queries.ts` | query objects `X_QUERY = { queryKey, queryOptions, invalidate }` (uses `queryClient` from `@/shared/api`) |
| `x.mutation.ts` | `useXMutation` hook: API call + invalidation + `onError: notifyApiError` |
| `x.service.ts` | orchestration of several API calls, no React (e.g. login-or-register) |
| `x.context.ts` / `x.provider.tsx` | React context + hook / provider component (split for fast refresh) |
| `x.types.ts` | app types |
| `x.mappers.ts` | API ⇄ app mapping |
| `x.lib.ts` | pure business functions (scoring, message parsing, guards) |
| `x.model.ts` | hooks/context/state; `x.manager.ts` for subscriptions (WebSocket) |
| `x.schema.ts` | form validation |
| `x.ui.tsx`, `x.ui.<modifier>.tsx` | JSX only, e.g. `question.ui.card.tsx` |

## Decisions

- Start in the page; move down to features/entities when reused or when it is a user action.
- Keep React thin: logic goes to pure functions in `*.lib.ts` (unit-testable).
- WebSocket game state: `entities/active-game` (provider + typed `ServerMessage`/`ClientMessage`,
  pure parsing in `active-game.lib.ts`); host actions in `features/active-game/control-game`,
  player answer in `features/active-game/submit-answer`.
- Host, player and winners screens share one `ActiveGameProvider` mounted by
  `SessionPage` (`/join/:sessionId`), so the winners screen keeps the game state.
- Session (user id in localStorage, auth cookie) lives in `entities/session`; read it via its API,
  never `localStorage` directly. Other entities' UI gets the user id as a prop (`UserAvatar`).
