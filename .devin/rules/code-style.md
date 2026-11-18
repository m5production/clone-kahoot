---
description: TypeScript/React/Tailwind code style for src/
trigger: glob
globs: src/**/*.ts,src/**/*.tsx
---

# Code style

- Functional components; `const` arrow functions.
- Avoid `any`, `as`, `!`; prefer `interface` for object shapes; no `enum` — use `as const` maps.
- Early returns; descriptive names; event handlers prefixed `handle` (`handleSubmit`).
- Keep React thin: business logic in pure functions (`*.lib.ts`), API in `*.api.ts`.
- Styling with Tailwind classes, mobile-first; combine with `cn()`. Don't keep Tailwind classes in
  module-level string constants — use a component or a `cva` variant in `shared/ui` instead.
- Accessibility: real `<button>`/`<a>`, labels for inputs, `aria-*` for state.
- Add comments only when they are really needed.
