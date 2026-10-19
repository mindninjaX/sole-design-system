# Porting brief: Sole HQ parts into @sole-ui/react 0.2.0

Read by every builder. Read only the HQ source; never edit it. Work only in `~/Projects/sole-design-system`.

`HQ` = `/Users/rishabh/Projects/sole-hq/.claude/worktrees/sole-hq-figma-audit-d4ffe2/app/src`
Node: `export PATH=/usr/local/bin:$PATH` (the default node is an alpha that npm refuses).

## What you build

A group of parts, moved from HQ into `packages/ui/src/` with the same look and behaviour (same classes, comments,
`data-slot` and `data-*` attributes), made presentational, React 18 and 19 safe, with their tests, plus a docs section.
The plan is `docs/superpowers/plans/2026-10-19-sole-design-system-build.md` (Global Constraints, split table, task
B1 to B5); this brief overrides it where they differ (the docs are one small Vite page, not MDX).

## Foundation already there (do not edit these)

- `src/lib/cn.ts` (`cn`), `src/lib/person.ts` (`SolePerson { id; name; avatarUrl?; isBot? }`, `FORMER_MEMBER`,
  `initials`, `personName`), `src/lib/colour.ts` (`avatarColour`, `boardGradient`, ...), `src/lib/hue.ts` (`Hue`,
  `HUES`), `src/lib/platform.ts` (`isApple`, `modKeyName`), `src/lib/dates.ts` (HQ's dates with `now` always passed in;
  `DateOnly`, `dueChip`, `formatRelative`, ...), `src/lib/sole-provider.tsx` (`SoleProvider`, `useSole()` ->
  `{ linkComponent, timeZone, now, personHref }`, `SoleLink`, `useNow()`, `useToday()`). `SoleProvider` already wraps
  its children in Radix `Tooltip.Provider`.
- `test/render.tsx`: `renderUi(ui, opts?)` wraps in `SoleProvider` pinned to `NOW` = Tue 29 Sep 2026 3:00 PM Sydney.
  From `src/components/<group>/x.test.tsx` import it as `../../../test/render.tsx`.
- `test/setup.ts`: jsdom stubs, jest-dom, cleanup. `vitest.config.ts` runs `src/**/*.test.{ts,tsx}`.
- Docs page: `apps/docs/src/doc.tsx` (`DocSection`, `Row`, `Stage`, `Canvas`), `apps/docs/src/demo/people.ts`
  (made-up people `ava, noah, mia, leo, zara, oliver, grace, bot`, `firms`, `boards`, `NOW`, `TODAY`).

## Rules for every file

1. First line `'use client';`. Imports are relative with the real extension (`'../../lib/cn.ts'`, `'../ui/button.tsx'`),
   no path aliases, no `@/`. Use `import type` for types (`verbatimModuleSyntax`). Imports of Radix come from the single
   `radix-ui` package like HQ. Icons from `lucide-react`.
2. React 18 and 19: every part that renders a DOM element or a Radix part is `React.forwardRef` with a `displayName`
   (use `React.ComponentRef<typeof X>` and `React.ComponentPropsWithoutRef<typeof X>`); never `ref` as a plain prop,
   never `<Context value>` (use `.Provider`), never `use()`. A part that only re-exports a Radix root or provider
   (renders no element) needs no ref. Keep shadcn's API shape and every `data-slot` name.
3. Presentational only: no react-router (`Link`/`NavLink` -> `SoleLink` from `../../lib/sole-provider.tsx`, or an `href`
   prop plus `active?: boolean`), no fetching, no HQ database types (`@shared/db`), no `@/data`. HQ `Person`
   (`full_name`, `email`, `avatar_path`, `is_bot`) -> `SolePerson` (`name`, `avatarUrl`, `isBot`). HQ helpers -> `src/lib`.
   `useNow`/`useToday`/`appNow` -> the package's `useNow`/`useToday` from `sole-provider.tsx`. Domain logic over HQ's
   rows stays in HQ: the part takes the result as props.
4. Copy: plain words, sentence case, "Could not ..." for failures, no exclamation marks, Australian spelling.
5. Demo data in tests and docs is made up (use `apps/docs/src/demo/people.ts` in docs; in tests write your own inline
   people such as Ava Thompson). Never copy a name, email or firm from HQ's fixtures, gallery or tests: those are real
   staff. Emails are `@example.com`.
6. TypeScript is strict (`noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`). No `any`, no
   `@ts-ignore`; `@ts-expect-error` only in tests with a reason.

## Shared contracts (other builders import these exact paths and names)

Paths are under `packages/ui/src/`. Same exported names as HQ unless stated.

- `components/ui/<name>.tsx` for each shadcn part, same file names as HQ's `components/ui` (`button.tsx`,
  `tooltip.tsx`, `command.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `select.tsx`, `sheet.tsx`, `alert-dialog.tsx`,
  `badge.tsx`, `calendar.tsx`, `checkbox.tsx`, `input.tsx`, `label.tsx`, `scroll-area.tsx`, `separator.tsx`,
  `skeleton.tsx`, `sonner.tsx`, `switch.tsx`, `tabs.tsx`, `textarea.tsx`, `toggle.tsx`, `toggle-group.tsx`,
  `alert-dialog.tsx`). `ui/avatar.tsx` is NOT moved.
- `components/sole/avatar.tsx`: `Avatar({ person: SolePerson | null | undefined, size?: AvatarSize, label?: boolean,
  className? })`, `AvatarStack({ people: SolePerson[], max?, size?, className? })`, `type AvatarSize = 16 | 20 | 24 | 32 | 40 | 48 | 64`.
- `components/sole/person-chip.tsx`: `PersonChip({ person: SolePerson | null | undefined, link?: boolean, className? })`
  (links when `useSole().personHref(person)` returns an href; never for bots or a missing person).
- `components/sole/{pill,count-badge,kbd,label-tag,field,banner,copy-field,states,logo,person-header}.tsx`: HQ's names.
- `components/sole/{layout,table,filters,nav,column-header}.tsx` and `components/shell/{page,sidebar,app-frame,command-palette}.tsx`: see your task.
- `hq/*.tsx`: HQ's names, one HQ file -> one package file.

A file you need that another builder is still writing: import it by the path above anyway and code against the contract.
Do not create or edit another builder's file. If something you need is missing from the contract, tell the orchestrator
in your report instead of inventing it in another builder's file.

## Tests

Move the matching HQ tests (`HQ/components/sole/{sole,parts}.test.tsx`, `ui/sonner.test.tsx`, `shell/shell.test.tsx`, and
`HQ/lib/*.test.ts` cases for anything moved) into `<file>.test.tsx` beside each part, rewritten to `renderUi` and made-up
people. Add a `refs` test per group: `it.each([...])('%s forwards its ref', ...)` asserting the ref is an `HTMLElement`
(for each forwardRef part that renders an element). A suite that runs 0 tests is a failure. Run with
`cd packages/ui && npx vitest run <your test files>`.

## Docs section

Write `apps/docs/src/sections/<your-group>.tsx` exporting `export const sections: DocSection[]` (one entry per part or
tight family of parts). Each entry: `id`, `title`, `group`, `summary` (one or two plain sentences: what it is for), an
`importLine`, and `render()` showing EVERY variant, size and state live (every cva variant and size, disabled, loading,
empty, error where the part has them; overlays get a trigger that opens them). Build from `Row`, `Stage`, `Canvas`
(`../doc.tsx`). Import parts from `'@sole-ui/react'` (shared, Sole, shell) or `'@sole-ui/react/hq'` (HQ parts) and demo
data from `'../demo/people.ts'`. Keep it short and working: no prose beyond the summary. Calendar examples pin `month`
to September 2026.

## Do not

- Do not commit, do not run `npm install`, do not edit the barrels (`src/index.ts`, `*/index.ts`: the orchestrator
  generates them from your files), `package.json`, the lib files or another builder's files.
- Do not edit the sole-hq repo or any Figma file.

## HQ migration notes

Append to `docs/hq-migration/<your-group>.md`: one row per export, `HQ import -> package import`, and each API change
with the HQ call site that needs it (one line each).

## Report

Reply with: the files you wrote with each file's exports; test counts (`N passed`); anything you could not do or that
another group must provide; any API deviation from HQ. Typecheck your own files with
`cd packages/ui && npx tsc -p tsconfig.json 2>&1 | grep -E "<your file names>"` (other builders' files will have errors
while they work; ignore those) and `cd apps/docs && npx tsc -p tsconfig.json 2>&1 | grep <your section file>` (it will
resolve once the barrels exist, so type errors of the form "no exported member" for your own parts are expected until then).
