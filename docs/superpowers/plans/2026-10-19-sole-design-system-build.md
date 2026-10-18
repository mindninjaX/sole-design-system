# Sole design system build: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One npm package (`@soleapp/ui`) and one documentation site (GitHub Pages) that hold Sole's look and every
shared, Sole HQ and Sole CRM part, typed, tested, screenshot-checked and readable by designers, developers and agents.

**Architecture:** An npm-workspaces monorepo. `packages/tokens` holds the one token source and generates DTCG JSON and
CSS. `packages/ui` is the package: presentational React components compiled by `tsc` (no bundler) to ESM with types,
plus a raw Tailwind v4 stylesheet the consumer's Tailwind compiles. `apps/docs` is a Vite + React + MDX site that
renders every example from the package's source and, after the build, writes route shells, Markdown twins, `llms.txt`,
`components.json` and a shadcn registry. Playwright screenshots every example and runs axe on every page.

**Tech stack:** Node 22 LTS (CI) / 24 (local OK), npm workspaces, TypeScript 7.0 (`tsc`), React 19 (peer `^18.3 ||
^19`), radix-ui 1.x, Tailwind v4.3, class-variance-authority, tailwind-merge 3, lucide-react, sonner 2, cmdk 1,
react-day-picker, Vite 8, Vitest 5 + jsdom + Testing Library, Playwright 1.6x + @axe-core/playwright, MDX 3, Shiki,
ts-morph (props tables; it bundles its own TypeScript because TS 7 has no JS API), oxlint, Changesets, size-limit,
publint, @arethetypeswrong/cli.

**Spec:** `docs/superpowers/specs/2026-10-19-sole-design-system-design.md` (read all of it, including "Settled after
the builder check" and "Scope and publishing").

**Sources (read only, never modify):**

- `HQ` = `/Users/rishabh/Projects/sole-hq/.claude/worktrees/sole-hq-figma-audit-d4ffe2` (sole-hq at `89668d5`).
  Parts: `HQ/app/src/components/ui/*`, `HQ/app/src/components/sole/*`, shell parts in `HQ/app/src/components/shell/`
  (`sidebar.tsx`, `page.tsx`, `app-shell.tsx`, `command-palette.tsx`), tokens `HQ/app/src/styles/globals.css`, helpers
  in `HQ/app/src/lib/`, tests `*.test.tsx` beside them, the gallery `HQ/app/src/components/gallery/`, the rules in
  `HQ/specs/brand-and-ux.md` (1.6 tone and wording, 5.x design direction).
- Sole CRM Figma `M1gnnaJXW4nyOdVTmkbxxp`, page `🧩 Components` (read with figma-console `figma_execute` and `fileKey`;
  never write).
- Sole HQ Figma `RnRT8ThBzyTmynmrCUmzFl` (being rebuilt by other sessions; read only, for links).
- The Dialer `~/Projects/sole-dialer` (read only; React 18.3, Vite 5, react-router-dom 6, no Tailwind,
  `app/src/design/system.jsx`).

## Global Constraints

- Repository `~/Projects/sole-design-system`, GitHub `mindninjaX/sole-design-system`; docs at
  `https://mindninjax.github.io/sole-design-system/` (Vite `base: '/sole-design-system/'`).
- Package name `@soleapp/ui`, `"type": "module"`, ESM only, public on npmjs.com, `"license": "UNLICENSED"`,
  `"sideEffects": ["**/*.css"]`. Exports: `.`, `./hq`, `./crm`, `./styles.css`, `./tokens.json`, `./package.json`. Each
  JS export has a `"source"` condition pointing at `src/` (the docs resolve it) before `types` and `import`.
- Peers: `react` and `react-dom` `^18.3.0 || ^19.0.0`, `radix-ui` `^1.4.0`, `tailwindcss` `^4.1.0`. Everything else the
  components import is a dependency. `toast` is re-exported from the package so the consumer and the `Toaster` share one
  sonner instance.
- One look: tokens are exactly HQ's `globals.css` values (primary `#0270d6`, `--radius: 8px`, Inter Variable,
  `text-body` 13px/20px). A token value never changes in this job.
- Light mode and desktop only. `@custom-variant dark (&:is(.dark *));` stays so a stray `dark:` never fires.
- React 18 and 19: every component that renders a DOM element or a Radix part uses `React.forwardRef` with a
  `displayName`; never `ref` as a plain prop, never `<Context value>` (use `<Context.Provider>`), never `use()`. Every
  module under `packages/ui/src/components/**`, `packages/ui/src/hq/**`, `packages/ui/src/crm/**` and
  `packages/ui/src/lib/sole-provider.tsx` starts with `'use client';`.
- Keep shadcn's API shape and `data-slot` names. Look and behaviour are unchanged from HQ unless this plan says so.
- Presentational only: no react-router, no fetching, no HQ database types. Links go through `SoleLink` (the
  provider's `linkComponent`). People are `SolePerson` (`id`, `name`, `avatarUrl?`, `isBot?`). Domain logic over HQ's
  database rows stays in HQ; a part takes the result as props.
- Source imports are relative with their real extension (`'../lib/cn.ts'`); `tsc` rewrites them
  (`rewriteRelativeImportExtensions`). No path aliases inside `packages/ui`.
- TypeScript: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`,
  `verbatimModuleSyntax`, `isolatedModules`. No `any`, no `@ts-ignore`; `@ts-expect-error` only in tests, with a reason.
- Copy: plain words, sentence case, "Could not ..." for failures, no exclamation marks, Australian spelling (colour,
  organise), dates like `29 Sep`, as `HQ/specs/brand-and-ux.md` 1.6 says.
- Demo data in docs, examples, tests and the skill is made up: people from `apps/docs/src/demo/people.ts`, emails at
  `example.com`, firms like "Harbour Accounting". Never a name or email from HQ's fixtures or gallery (those are staff).
  The fixed "today" is Tuesday 29 Sep 2026, 3:00 PM Australia/Sydney (`2026-09-29T05:00:00Z`).
- Every test command reports counts; a suite that runs 0 tests is a failure.
- Never modify the sole-hq repo, Sole CRM, the Dialer or any Figma file. Never print or commit a secret.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. During parallel waves, builders do not
  commit; the orchestrator commits each wave.

## Review Focus

1. **A consumer's Tailwind does not see the package's classes.** Expected: `@import "tailwindcss"; @import
   "@soleapp/ui/styles.css";` in a fresh Vite app is enough for every part to render styled. Test: Task C4's consumer
   smoke asserts a package-only class (`bg-primary`, `text-micro`, `rounded-xl`) is in the built CSS.
2. **Refs on React 18.** Expected: `<TooltipTrigger asChild><Button/></TooltipTrigger>` positions and opens on React
   18.3. Tests: the ref test in each group (Tasks B1 to B5) and the React 18 CI job (Task C4) running the whole suite.
3. **Portals and overlays in screenshots.** Expected: an open dialog, menu, select, popover, tooltip, toast and command
   palette each have an approved screenshot of the open state. Test: example `meta.interact` (Task A3) and the visual
   suite (Task C4) failing when an overlay example captured nothing (an element screenshot of an empty root is refused).
4. **A docs page drifting from the code.** Expected: a renamed prop or a new export breaks CI. Tests: props tables come
   from the types at build (Task A3), the coverage check fails on an undocumented value export (Task A3), examples are
   typechecked (Task A3), the registry and skill are regenerated and diffed in CI (Tasks C2, C3).
5. **A real staff name or email leaking into the public docs.** Expected: CI fails. Test: `scripts/check-names.ts`
   (Task A1) over `packages`, `apps`, `skills`, hashing words and word pairs against a committed list of SHA-256 hashes
   (the names themselves are never committed) and refusing any `@soleapp.com.au` address.

---

## File structure

```
sole-design-system/
  package.json                 workspaces, root scripts (build, test, typecheck, lint, check)
  tsconfig.base.json           the strict options above
  .nvmrc (22)  .gitignore  .editorconfig  oxlintrc.json  README.md  AGENTS.md  CLAUDE.md -> AGENTS.md
  .changeset/config.json       access public, baseBranch main
  scripts/
    check-all.ts               runs every gate locally, prints counts, exits 1 on any failure or 0-test suite
    check-names.ts             staff-name and staff-email guard (hashes in scripts/names.sha256)
    smoke/                     consumer smoke: vite-app template, next-app template, run.ts
  packages/tokens/             private workspace
    src/tokens.ts              THE token source (values copied from HQ globals.css)
    src/build.ts               writes dist/tokens.json (DTCG) and ../ui/src/styles/tokens.css (generated, committed)
    test/hq-globals.css        HQ globals.css at 89668d5, the zero-drift fixture
    test/tokens.test.ts
  packages/ui/                 @soleapp/ui
    src/styles/styles.css      imports tokens.css, theme mapping, base, utilities, Inter, @source
    src/styles/tokens.css      GENERATED
    src/lib/                   cn.ts, person.ts, colour.ts, hue.ts, platform.ts, dates.ts, sole-provider.tsx
    src/components/ui/         shadcn parts (shared)
    src/components/sole/       Sole parts (shared)
    src/components/shell/      app frame, sidebar parts, top bar, page (shared)
    src/hq/                    HQ-only parts + types.ts
    src/crm/                   CRM-only parts + types.ts
    src/index.ts  src/hq/index.ts  src/crm/index.ts
    test/setup.ts  test/render.tsx
  apps/docs/                   private workspace
    src/content/{guides,foundations,components,hq,crm,patterns,products}/*.mdx
    src/examples/<page-slug>/<name>.tsx
    src/demo/people.ts         made-up people, firms, boards
    src/site/                  layout, nav, Example, PropsTable, CodeBlock, search
    vite/examples-plugin.ts    virtual:examples (component + raw source + Shiki HTML + meta)
    scripts/docgen.ts          props.json from the package's types (ts-morph)
    scripts/postbuild.ts       route shells, 404, Markdown twins, llms.txt, llms-full.txt, components.json, registry
    scripts/check-coverage.ts  every value export documented exactly once
    e2e/                       visual.spec.ts, a11y.spec.ts, routes.ts, __screenshots__/linux/...
  registry/                    generated shadcn registry.json input (build artefact, not committed)
  skills/sole-design-system/   SKILL.md, references/*.md (generated parts marked), README.md
  .github/workflows/           ci.yml, docs.yml, release.yml, update-screenshots.yml
```

## Shared, HQ and CRM split

The rule (spec): used by more than one product → shared entry `@soleapp/ui`; one product → its entry.

| Entry | Parts (HQ source file → package file) |
| --- | --- |
| shared, shadcn | `ui/{alert-dialog,badge,button,calendar,checkbox,command,dialog,dropdown-menu,input,label,popover,scroll-area,select,separator,sheet,skeleton,sonner,switch,tabs,textarea,toggle,toggle-group,tooltip}.tsx` → `components/ui/` (same names). `ui/avatar.tsx` is not moved: nothing in HQ uses it and its names clash with Sole's `Avatar`. |
| shared, Sole | `sole/{avatar,banner,copy-field,count-badge,field,filters,kbd,label-tag,layout,logo,nav,person-chip,person-header,pill,states,table}.tsx` → `components/sole/`; `ColumnHeader` from `sole/rows.tsx` → `components/sole/column-header.tsx` (icon slot, see B4) |
| shared, shell | `shell/page.tsx` (`Breadcrumbs`, `TopBar`, `Page` without `useDocumentTitle`), presentational pieces of `shell/sidebar.tsx` and `shell/app-shell.tsx`, the palette frame of `shell/command-palette.tsx` → `components/shell/` |
| `/hq` | `sole/{activity-line,board-card,board-chip,cards,comment,due-chip,group-header,inbox-row,page-row,priority-icon,property-type-icon,review-badge,state-icon,state-pill,work-item-row}.tsx`, `ChecklistItem`, `LinkRow`, `RecentItem` from `sole/rows.tsx` → `hq/` |
| `/crm` | built from Figma in Task D1 |
| `/dialer` | not created in this job (step 4) |

Ask parts, comments, pickers, the editor and the data-wired shell (sidebar data, new work item dialog, shortcuts sheet,
demo banner) stay in HQ for the first release (spec: HQ keeps its data wiring and composes package parts).

---

## Wave A (sequential): foundations

### Task A1: Repository, tooling, tokens

**Files:** root files listed above; `packages/tokens/**`; `scripts/check-names.ts`, `scripts/names.sha256`,
`scripts/check-all.ts` (first version: tokens, typecheck, lint, names), `AGENTS.md`, `README.md`.

**Interfaces — Produces:**
- `packages/tokens/src/tokens.ts`: `export const tokens: TokenTree` where every leaf is `{ $value: string; $type:
  'color' | 'dimension' | 'fontFamily' | 'shadow' | 'cubicBezier' | 'number'; $description?: string }`, grouped
  `color.*` (every `:root` colour, kebab names as in HQ), `hue.<name>.{bg,border,fg,dot}` (12 hues), `radius.base`,
  `shadow.{elevation-sm,elevation-lg,focus-ring}`, `ease.rise`, `font.{sans,mono}`, `text.<style>.{size,line-height,
  weight?,letter-spacing?}` (label, body, strong, read, title, page, doc, metric, micro).
- `npm run build -w @sole/tokens` writes `packages/tokens/dist/tokens.json` (DTCG, `$schema` omitted) and
  `packages/ui/src/styles/tokens.css` (header `/* Generated by packages/tokens. Do not edit. */`, the `:root` block in
  HQ's order with HQ's comments, the 12 `.hue-*` classes, the `@theme inline` block, the `text-micro` `@utility`).
- `npm run tokens:check` regenerates and fails if `git diff --exit-code` shows a change.
- `scripts/check-names.ts`: `node scripts/check-names.ts [paths...]` exits 1 and prints `file:line` for each hit.

- [ ] **Step 1: Scaffold.** Root `package.json` (`"private": true`, workspaces `packages/*`, `apps/*`, engines
  `node >=22.22.0`, scripts `build`, `test`, `typecheck`, `lint`, `tokens:check`, `check`), `tsconfig.base.json` (Global
  Constraints options, `target es2023`, `module esnext`, `moduleResolution bundler`, `jsx react-jsx`,
  `allowImportingTsExtensions`, `rewriteRelativeImportExtensions`, `erasableSyntaxOnly` for scripts), `oxlintrc.json`
  (plugins `react`, `jsx-a11y`, `typescript`, `import`; `--deny-warnings` in the script), `.nvmrc` `22`, `.gitignore`
  (`node_modules`, `dist`, `test-results`, `playwright-report`, `apps/docs/e2e/__screenshots__/darwin`, `*.tgz`,
  `.env*`), `.changeset/config.json` (`"access": "public"`, `"baseBranch": "main"`, `"ignore": ["@sole/docs",
  "@sole/tokens"]`). Install every dependency the later tasks name (ui, docs, test, e2e) in this task, so parallel
  builders never run `npm install`. Use `/usr/local/bin/node` (v24) locally: `export PATH=/usr/local/bin:$PATH`.
- [ ] **Step 2: Write the failing token tests** in `packages/tokens/test/tokens.test.ts`:
  - `every HQ custom property has the same value`: parse `test/hq-globals.css` (copy of `HQ/app/src/styles/globals.css`)
    for `--name: value;` inside `:root`, `.hue-*` and `@theme inline`; parse generated `tokens.css` the same way; expect
    the two maps to be equal (same keys, same values, case-insensitive hex).
  - `pins the Sole look`: `tokens.color.primary.$value === '#0270d6'`, `tokens.radius.base.$value === '8px'`,
    `tokens.text.body.size.$value === '13px'`, `tokens.text.body['line-height'].$value === '20px'`,
    `tokens.font.sans.$value` starts with `"Inter Variable"`.
  - `writes valid DTCG`: every leaf in `dist/tokens.json` has `$value` and a `$type` from the list above.
- [ ] **Step 3: Run** `npm test -w @sole/tokens`. Expected: FAIL (no source yet).
- [ ] **Step 4: Implement** `tokens.ts` (values copied from HQ, comments kept as `$description`) and `build.ts`.
- [ ] **Step 5: Run** `npm run build -w @sole/tokens && npm test -w @sole/tokens`. Expected: 3 passed.
- [ ] **Step 6: Names guard.** Build `scripts/names.sha256` from every `full_name` in `HQ/app/src/data/fixtures/*.ts`
  except `Taskmate` and `Sole Dialer`, plus the extra first names the orchestrator passes in the prompt: one SHA-256 per lowercased full name, first name and surname
  (never write the names to any file). `check-names.ts` tokenises text files into words and adjacent word pairs,
  lowercases, hashes, and reports matches; it also reports any `@soleapp.com.au`. Default paths: `packages apps skills
  README.md`. Test it in `scripts/check-names.test.ts` with a temp file containing a hashed fixture name built at test
  time from a made-up name added to a temp hash list (so the test itself holds no real name): expect exit 1 and the
  `file:line`; a clean file exits 0.
- [ ] **Step 7: `AGENTS.md`** (and `CLAUDE.md` containing `@AGENTS.md`): what the repo is, the Global Constraints in
  short, the commands, where the docs, examples, registry and skill come from, "never edit generated files".
- [ ] **Step 8: Verify** `npm run tokens:check && npm run typecheck && npm run lint && node scripts/check-names.ts`.
  Expected: all exit 0. Commit `Scaffold the repository and the token source`.

### Task A2: The package skeleton and its library code

**Files:** `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/tsconfig.build.json`,
`packages/ui/vitest.config.ts`, `packages/ui/test/{setup.ts,render.tsx}`, `packages/ui/src/styles/styles.css`,
`packages/ui/src/lib/*` (+ tests), `packages/ui/src/{index.ts,hq/index.ts,crm/index.ts}`, empty group barrels
`components/ui/index.ts`, `components/sole/index.ts`, `components/shell/index.ts`, `.size-limit.json`.

**Interfaces — Produces** (later tasks use exactly these):
- `lib/cn.ts`: `cn(...inputs: ClassValue[]): string` (HQ's `lib/utils.ts`, with the type-scale `font-size` group).
- `lib/person.ts`: `interface SolePerson { id: string; name: string; avatarUrl?: string | null; isBot?: boolean }`,
  `FORMER_MEMBER = 'Former member'`, `initials(name: string): string` (HQ's).
- `lib/colour.ts`: `fnv1a`, `AVATAR_COLOURS`, `avatarColour(id)`, `BOARD_GRADIENTS`, `boardGradient(id)` (HQ's
  `lib/hash.ts`, values unchanged).
- `lib/hue.ts`: `type Hue = 'slate' | 'indigo' | 'violet' | 'blue' | 'cyan' | 'teal' | 'green' | 'lime' | 'amber' |
  'orange' | 'rose' | 'pink'`, `HUES: readonly Hue[]`.
- `lib/platform.ts`: `isApple()`, `modKeyName()` (HQ's).
- `lib/dates.ts`: `type DateOnly = string`, `type Timestamp = string`, `SYDNEY`, and from HQ's `lib/dates.ts` with their
  tests: `isDateOnly`, `dateIn`, `todayDate(now, tz)`, `addDays`, `daysBetween`, `DueTone`, `DueChipModel`, `dueChip`,
  `formatDate`, `formatLongDate`, `formatTime`, `formatTimestampDate`, `formatRelative`, `formatDayTime`,
  `formatFullTimestamp`. Every `now` and `tz` parameter is required (no app clock inside the package).
- `lib/sole-provider.tsx`:
  `interface SoleLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> { href: string }`,
  `type SoleLinkComponent = ComponentType<SoleLinkProps & RefAttributes<HTMLAnchorElement>>`,
  `interface SoleProviderProps { children: ReactNode; linkComponent?: SoleLinkComponent; timeZone?: string; now?: () =>
  Date; personHref?: (person: SolePerson) => string | null }`, `SoleProvider`, `useSole()` (returns the four values with
  defaults: plain `<a>`, `'Australia/Sydney'`, `() => new Date()`, `() => null`), `SoleLink` (forwardRef, renders the
  provider's link component; an `href` starting `http` renders a plain `<a>`), `useNow(intervalMs = 60_000): Date`,
  `useToday(): DateOnly`.
- `styles.css`: `@import "tw-animate-css"; @import "@fontsource-variable/inter"; @import "./tokens.css";` then the
  `@custom-variant dark`, `@layer base` and reduced-motion blocks from HQ, then `@source "../";` so the consumer's
  Tailwind scans the package's own files (in `dist` this resolves to `dist/`). The build copies `styles.css` and
  `tokens.css` to `dist/` and `packages/tokens/dist/tokens.json` to `dist/tokens.json`.
- `test/render.tsx`: `renderUi(ui: ReactNode, opts?: { provider?: Partial<SoleProviderProps> })` wraps in
  `SoleProvider` (pinned `now` = `2026-09-29T05:00:00Z`, `timeZone` Sydney) and `TooltipProvider` once B2 lands (add it
  there). `test/setup.ts` = HQ's jsdom stubs (matchMedia, scrollIntoView, pointer capture, ResizeObserver),
  jest-dom, cleanup.
- Barrels: `src/index.ts` re-exports `./lib/{cn,person,colour,hue,platform,dates,sole-provider}.ts`,
  `./components/ui/index.ts`, `./components/sole/index.ts`, `./components/shell/index.ts`, and `export { toast } from
  'sonner'`. `src/hq/index.ts` and `src/crm/index.ts` start as `export {};`.

- [ ] **Step 1: Failing tests** `lib/*.test.ts(x)`: HQ's `dates.test.ts` cases for the moved functions (with explicit
  `now`/`tz`); `initials('Ava Thompson') === 'AT'`, `initials('ava.t') === 'A'`, `initials('') === '?'`;
  `avatarColour` returns a member of `AVATAR_COLOURS` and is stable for one id; `SoleLink` renders the provider's
  component for `/x` and a plain anchor for `https://example.com`; `useToday()` under a provider pinned to
  `2026-09-29T14:30:00Z` (Sydney is already the 30th) returns `'2026-09-30'`; a ref passed to `SoleLink` reaches the
  `HTMLAnchorElement`.
- [ ] **Step 2: Run** `npm test -w @soleapp/ui`. Expected: FAIL.
- [ ] **Step 3: Implement** the lib files and `styles.css`.
- [ ] **Step 4: Build.** `build` script = `tsc -p tsconfig.build.json && node scripts/copy-assets.ts`. Add `publint`
  and `attw --pack . --profile esm-only` as `check:package`. Add `.size-limit.json` with one entry per JS entry
  (`dist/index.js`, `dist/hq/index.js`, `dist/crm/index.js`, `import: "*"`, react/radix ignored); set limits after B5
  to measured + 10%.
- [ ] **Step 5: Verify** `npm test -w @soleapp/ui && npm run build -w @soleapp/ui && npm run check:package -w
  @soleapp/ui`. Expected: tests pass with counts; `dist/index.js` starts `'use client'` where required; publint and
  attw report no errors. Commit `Add the package skeleton, its library code and its stylesheet`.

### Task A3: The docs site skeleton, examples, props tables and coverage

**Files:** `apps/docs/**` (everything in the tree above except content and examples, which waves B to D add),
`apps/docs/src/demo/people.ts`, `apps/docs/src/content/guides/{index,get-started,agents}.mdx`,
`apps/docs/src/content/components/_template.mdx.txt` (the page template, not routed).

**Interfaces — Produces:**
- Page frontmatter (validated by `src/site/frontmatter.ts`, `parseFrontmatter(raw: unknown): PageMeta`, throws with the
  file name):
  ```ts
  interface PageMeta {
    title: string; description: string;
    section: 'guides' | 'foundations' | 'components' | 'hq' | 'crm' | 'patterns' | 'products';
    slug: string;                 // from the file name
    order?: number;
    components?: string[];        // value exports documented here; each export on exactly one page
    entry?: 'shared' | 'hq' | 'crm';                     // required on components/hq/crm pages
    figma?: string | null; figmaNote?: string;           // null needs figmaNote ("Not in the Figma file yet")
    products?: Array<'hq' | 'crm' | 'dialer'>;           // required on components/hq/crm pages
  }
  ```
  Route = `/${section}/${slug}` (guides: `/` for `index`, `/${slug}` otherwise).
- MDX components available on every page without import: `<Example id="button/variants" />`, `<PropsTable of="Button"
  />`, `<ImportLine of="Button" />` (prints `import { Button } from '@soleapp/ui'` using the page `entry`),
  `<FigmaLink />` (from frontmatter), `<UsedIn />`, `<DoDont do="..." dont="..." />`, `<TokenTable group="color" />`.
- Examples: `apps/docs/src/examples/<page-slug>/<name>.tsx` default-exports a component with no props and may export
  `meta: ExampleMeta`:
  ```ts
  interface ExampleMeta {
    title?: string;
    capture?: 'element' | 'viewport';          // default 'element'; overlays use 'viewport'
    interact?: { action: 'click' | 'hover' | 'focus' | 'press'; role?: string; name?: string; key?: string };
    width?: number;                            // element capture width, default intrinsic
  }
  ```
  `virtual:examples` exports `examples: Record<string, { id: string; load: () => Promise<{ default: ComponentType;
  meta?: ExampleMeta }>; source: string; html: string }>` (`source` with the docs-only import paths kept as written;
  `html` = Shiki `github-light`). Examples import from `@soleapp/ui`, `@soleapp/ui/hq`, `@soleapp/ui/crm` and
  `@/demo/people` only.
- Route `/examples/<page-slug>/<name>` renders one example alone in `<div data-example-root class="inline-block p-6
  bg-card">` (`noindex`); `e2e/routes.ts` exports `pageRoutes(): string[]` and `exampleRoutes(): Array<{ id; route;
  meta }>` read from the same files.
- `scripts/docgen.ts` writes `apps/docs/src/generated/props.json`: `Record<ExportName, { description: string; props:
  Array<{ name: string; type: string; required: boolean; default?: string; description?: string }>; extends: string[]
  }>` for every component exported from the three entries (own props only; inherited DOM and Radix props summarised in
  `extends`, for example `"<button> attributes"`, `"Radix Dialog.Root"`). Defaults come from destructuring defaults.
- `scripts/check-coverage.ts`: lists value exports of the three entries with ts-morph; fails if one is on no page, on
  two pages, or a page names a missing export; prints `documented N of M`.
- Demo data `src/demo/people.ts`: `people` (8 made-up `SolePerson`s: Ava Thompson, Noah Patel, Mia Rossi, Leo Nguyen,
  Zara Ahmed, Oliver Brooks, Grace Kim, Taskmate as `isBot`), `firms` (Harbour Accounting, Northside Payroll, Bright &
  Co Bookkeeping), `boards` (Engineering 💻 ENG, Customer success 🤝 CS, Payroll 💸 PAY), `NOW`, `TODAY`.
- Layout: the docs dogfood the package as parts land: a 240px sidebar of sections, a 48px top bar with breadcrumbs, a
  ⌘K search over page titles (a plain list until `CommandDialog` exists in B1), content max width 880px. Until B1 to B4
  land, use plain elements styled with the Sole tokens; Task C1 swaps in package parts.

- [ ] **Step 1: Failing tests** (`apps/docs/test/*.test.ts`, Vitest node env): `parseFrontmatter` rejects a
  component page without `entry` and accepts the template; `docgen` on `test/fixtures/fixture-button.tsx` (a forwardRef
  button with a cva `variant`, a JSDoc'd `loading?: boolean` defaulting to `false`, and `<button>` props) returns
  `variant: '"default" | "ghost"'`, `loading` with `default: 'false'` and its description, `extends: ['<button>
  attributes']`; the examples plugin turns a fixture example into `{ source, html }` with Shiki spans; `check-coverage`
  on a fixture entry with one undocumented export exits 1 and names it.
- [ ] **Step 2: Run** `npm test -w @sole/docs`. Expected: FAIL.
- [ ] **Step 3: Implement** the site (Vite 8, `@vitejs/plugin-react`, `@tailwindcss/vite`, `@mdx-js/rollup` with
  `remark-gfm`, `remark-frontmatter`, `remark-mdx-frontmatter`, `@shikijs/rehype`; react-router 8 `createBrowserRouter`
  with `basename` from `import.meta.env.BASE_URL`; pages from `import.meta.glob('./content/**/*.mdx')`, lazily loaded;
  `resolve.conditions: ['source', ...]` so `@soleapp/ui` resolves to `packages/ui/src`; `src/styles.css` = `@import
  "tailwindcss"; @import "@soleapp/ui/styles.css"; @source "./";`), `docgen.ts`, `check-coverage.ts`, the examples
  plugin, and the guides pages (home: what Sole's system is and the three entries; get started: install, the two CSS
  lines, `SoleProvider` with a react-router and a Next `Link` adapter, Tailwind `@source` notes for Vite and Next, React
  18 note; agents: the agent files and the skill, filled in by C2 and C3).
- [ ] **Step 4: Postbuild, first part.** `scripts/postbuild.ts` writes, for every page route, `dist/<route>/index.html`
  (a copy of `dist/index.html` with that page's `<title>{title} · Sole design system</title>`, `<meta
  name="description">`, and `<link rel="alternate" type="text/markdown" href="<route>.md">`), and `dist/404.html`.
  The Markdown twins, `llms*.txt`, `components.json` and registry are Task C2.
- [ ] **Step 5: Verify** `npm test -w @sole/docs && npm run build -w @sole/docs && npx vite preview` in `apps/docs`;
  open `/sole-design-system/get-started` directly (deep link, 200) and an example route. Expected: tests pass, the page
  renders in Inter 13/20 on `#f5f5f5`. Commit `Add the docs site skeleton, examples, props tables and coverage check`.

## Waves B1 and B2 (parallel): the shared and HQ parts, each with its pages

Every B task follows the same recipe, so each task below lists only its parts and what changes.

**Recipe (applies to every B task):**
1. Copy the HQ source files to the package paths in the split table; keep code, classes, comments and `data-*`
   attributes. Fix imports to relative `.ts`/`.tsx` paths.
2. Apply the Global Constraints: `'use client'`, `forwardRef` + `displayName` for every DOM-rendering part, react-router
   → `SoleLink` or an `href` prop (+ `active?: boolean` where HQ used `NavLink`), HQ `Person` → `SolePerson`, HQ helpers
   → `lib/*`, `useNow`/`useToday` → the package's.
3. Move the matching HQ tests (`HQ/app/src/components/sole/{sole,parts}.test.tsx`, `ui/sonner.test.tsx`, and the
   `lib/*.test.ts` cases for any helper moved) into `<group>.test.tsx` beside the parts, rewritten to `renderUi` and
   made-up people. Add one `refs` test per group: `it.each(PARTS)('%s forwards its ref', ...)` asserting the ref is an
   `HTMLElement`.
4. Write each part's page `apps/docs/src/content/<section>/<slug>.mdx` from `_template.mdx.txt`: what it is for, when
   not to use it, every variant and size live (one `variants` example that renders all cva combinations, plus one
   example per state: loading, empty, error, disabled where the part has them), `<PropsTable>`, `<ImportLine>`, a
   copyable example, keyboard and accessibility notes (roles, labels, keys), `<FigmaLink>`, `<UsedIn>`. Overlays have
   an example with `meta: { capture: 'viewport', interact: {...} }`.
5. Append the HQ-facing changes to `docs/hq-migration/<task-id>.md`: one row per export, `HQ import → package import`,
   and each API change with the HQ call site that needs it (for Task E2's step-2 gate).
6. Do not commit, do not run `npm install`, do not edit files another task owns (barrels: only your group's
   `index.ts`). Run `npx tsc -p packages/ui && npx vitest run <your files> && npx tsc -p apps/docs` and report counts.

### Task B1 (wave 1): shadcn overlays and menus

Parts: `alert-dialog`, `command`, `dialog`, `dropdown-menu`, `popover`, `select`, `sheet`, `tooltip`. Pages under
`components/`: alert-dialog, command, dialog, dropdown-menu, popover, select, sheet, tooltip. `TooltipProvider` is added
to `test/render.tsx` here. Add `CommandDialog` capture example (viewport, `press` `Meta+K` is not needed: render open
on click).

### Task B2 (wave 1): shadcn controls and basics

Parts: `badge`, `button`, `calendar`, `checkbox`, `input`, `label`, `scroll-area`, `separator`, `skeleton`, `sonner`
(`Toaster`), `switch`, `tabs`, `textarea`, `toggle`, `toggle-group`. Pages: button, badge, calendar, checkbox, input,
label, scroll-area, separator, skeleton, toast (`Toaster` + `toast`), switch, tabs, textarea, toggle, toggle-group.
`Calendar` examples pin `month` to Sep 2026 so screenshots never change with the date.

### Task B3 (wave 1): Sole shared parts

Parts and their changes: `Avatar`, `AvatarStack` (`person: SolePerson | null`; picture from `avatarUrl`; bot from
`isBot`; `AvatarSize` becomes `16 | 20 | 24 | 32 | 40 | 48 | 64`, new sizes use the same rules), `PersonChip` (link
from `personHref`, no link for bots and former members), `AvatarRow`, `PersonHeader`, `Kbd`, `keysText`, `CountBadge`,
`Pill`, `Banner`, `InlineError`, `InlineSuccess`, `Field`, `ReadOnlyField`, `CopyField`, `CenteredState`,
`EmptyState`, `ErrorState`, `NoAccess`, `SkeletonRows`, `useDelayed`, `LabelTag`, `LabelTags` (hue from `lib/hue.ts`),
`SoleMark`, `SoleLockup`. Pages: avatar, person-chip, person-header, kbd, count-badge, pill, banner, field,
copy-field, states (empty, error, no access, skeleton), tag (`LabelTag`), logo.

### Task B4 (wave 2, after B1 to B3): layout, tables, filters, navigation and shell

Parts and changes: `PageHeader`, `SectionLabel`, `SectionAction`, `SectionCard`, `ListCard`, `PropertyRow` (adds
optional `icon?: ReactNode` before the label, for CRM), `TableHeader`, `Table`, `TableRow`, `TableCell`, `PersonCell`,
`FilterChip`, `RemovableChip`, `SearchField`, `ViewSwitch` (keeps `BoardView`), `SubNav`, `SubNavItem` (`href` +
`active`, optional `icon`), `ColumnHeader` (now `icon?: ReactNode` instead of `group`, `addLabel?: string` defaulting
to `` `Add to ${name}` ``; HQ passes `<StateIcon group decorative />` and its own label). Shell, from HQ's
`shell/{page,sidebar,app-shell,command-palette}.tsx`: `AppFrame({ sidebar, aside?, banner?, children })` (the 1024px
min width, inset 8px content panel, 12px radius, aside beside the panel), `Sidebar({ rail?, children, className })`,
`SidebarHeader`, `SidebarItem({ href?, onClick?, icon, label, active?, badge?, shortcut?, rail? })` (its `RailTip`
inside), `SidebarGroup({ label, open?, onOpenChange?, rail?, children })`, `SidebarUser({ person, meta, rail?,
children: menu content })`, `SidebarSearch({ onClick, rail? })`, `Breadcrumbs`, `TopBar`, `Page` (no document
title; HQ keeps `useDocumentTitle` in its wrapper), `CommandPalette` frame (`CommandDialog` with Sole's palette sizing
and groups, data passed in). Pages: page-header, section-card, list-card, property-row, table, filters (filter chip,
removable chip, search field, view switch), sub-nav, column-header, app-frame, sidebar, top-bar, command-palette. The
app-frame and sidebar examples use made-up nav (Home, Inbox, My work, the demo boards).

### Task B5 (wave 2, after B1 to B3): HQ parts

Parts and changes (all in `src/hq/`, exported from `src/hq/index.ts`; HQ types in `src/hq/types.ts`: `StateGroup`,
`Priority`, `PRIORITY_LABELS`, `ReviewState`, `PropertyType`, `StickyColour`):
`StateIcon`, `STATE_GROUP_LABELS`, `StatePill` (takes `{ name, group }`), `PriorityIcon`, `PropertyTypeIcon`,
`DueChip` (`due`, `today?` defaulting to `useToday()`, `done?`), `ReviewBadge`, `ReviewStateBadge` (with `reviewBadge`
and its tests moved from HQ `lib/review.ts`), `GroupHeader`, `GroupLabel`, `WorkItemRow` and `BoardCard` (take
`item: WorkItemSummary` = the fields they read from HQ's `WorkItemView`, written out in `types.ts`, plus `href`),
`BoardChip`, `BoardEmoji` (`board: { id; name; emoji }`, `href?`), `PageRow` (`href`), `InboxRow` (`href`, `actor:
SolePerson | null`), `ActivityLine` (`actor`, `children` = the sentence HQ builds with `describeActivity`, `at`),
`Comment` (`author: SolePerson | null`), `Sticky`, `TemplateCard`, `MentionChip`, `CitationChip`, `ChecklistItem`,
`LinkRow`, `RecentItem` (`href`). Pages under `hq/`: state-icon, state-pill, priority-icon, property-type-icon,
due-chip, review-badge, group-header, work-item-row, board-card, board-chip, page-row, inbox-row, activity-line,
comment, sticky, template-card, mention-chip (with citation chip), checklist-item, link-row, recent-item.

## Wave C (parallel, after B): docs content, agent files, skill, CI

### Task C1: Foundations, patterns, products, and the docs on package parts

**Files:** `apps/docs/src/content/foundations/{colour,typography,spacing,radius,elevation,icons,motion,copy,demo-data}.mdx`,
`patterns/{forms,tables-and-lists,dialogs-and-confirmations,toasts,empty-and-loading,keyboard}.mdx`,
`products/{hq,crm,dialer}.mdx`, their examples, `src/site/*` (swap to package parts).

- [ ] Foundations: colour from `<TokenTable>` (every token, swatch, value, contrast against its usual background
  computed at build, usage rule from brand-and-ux 5.3); type scale rendered live with each `text-*` utility; spacing,
  density and control heights (5.5); radius and elevation (5.6); icons (lucide, 16px in rows, stroke 1.8, decorative
  icons `aria-hidden`; CRM's Figma uses Phosphor, the code uses lucide: note it); motion (120ms colour, 200ms panels
  on `ease-rise`, reduced motion); copy rules (1.6, with do/don't pairs); demo data rules (made-up people, the fixed
  today, `example.com`).
- [ ] Patterns: each with a working composed example from package parts (a form with `Field` errors, a table of
  people, a confirm `AlertDialog` for a destructive action, toast after save and "Could not ..." on failure, empty and
  loading states with `useDelayed`, keyboard shortcuts with `Kbd`).
- [ ] Products: HQ (its screens by name with the parts each uses, Figma file link), CRM (same, from its Figma
  `🖥 Screens` page names), Dialer (what moves in step 4 and when).
- [ ] Site: sidebar, top bar, search (`CommandDialog`), code copy (`CopyField` style), all from `@soleapp/ui`.
- [ ] Verify: `npm run build -w @sole/docs`, every route opens, `check-coverage` passes. Report counts.

### Task C2: Agent files and the shadcn registry

**Files:** `apps/docs/scripts/postbuild.ts` (second part), `apps/docs/scripts/markdown.ts`, `apps/docs/scripts/registry.ts`,
tests in `apps/docs/test/agent-files.test.ts`.

**Interfaces — Produces:** in `dist/`: `<route>.md` for every page (frontmatter as a header block, MDX prose kept,
`<Example id>` → a `tsx` fenced block of its source, `<PropsTable of>` → a Markdown table, `<ImportLine>` → a code
line, other JSX dropped); `llms.txt` (llmstxt.org format: title, one-paragraph summary, sections linking every `.md`);
`llms-full.txt` (all `.md` pages concatenated, guides first); `components.json` (`[{ name, page, entry, import,
props, variants: Record<string, string[]>, figma, docs, markdown }]`, variants from the props whose type is a string
union); `r/registry.json` and `r/<item>.json` from `shadcn build` over a generated `registry.json`: one `registry:ui`
item per shared shadcn part and Sole part with imports rewritten (`../../lib/cn.ts` → `@/lib/utils`, sibling ui parts →
`@/components/ui/<name>`, Sole parts → `@/components/sole/<name>`), a `registry:lib` item `utils` (the extended `cn`),
and a `registry:theme` item `sole-theme` carrying every token as `cssVars.light` and `cssVars.theme`.

- [ ] Tests first: the Markdown twin of the button page contains the variants example source and a props table row
  for `variant`; `components.json` has `Button` with `import: "import { Button } from '@soleapp/ui'"` and
  `variants.variant` including `"default"`; `r/button.json` content has `from "@/lib/utils"` and no `'../`; `llms.txt`
  links every page route; then implement; verify with the build and `npx shadcn@latest view` against the built item
  (or the C4 smoke).

### Task C3: The Claude skill

**Files:** `skills/sole-design-system/SKILL.md`, `references/{components,tokens,patterns,rules,setup}.md`,
`README.md` (install: copy the folder to `~/.claude/skills/`), `scripts/build-skill.ts` (writes the references from
the built docs' Markdown and `components.json`, each generated file headed `<!-- Generated by scripts/build-skill.ts
-->`), a CI step that rebuilds and diffs.

- [ ] `SKILL.md`: frontmatter `name: sole-design-system`, `description` that triggers on building or reviewing UI for
  any Sole tool (Sole HQ, Sole CRM, the Dialer, a new internal tool) or on `@soleapp/ui`; the body: when to use which
  entry, setup in 6 lines, the decision table "I need X → use part Y" for every part, the rules (tokens never hex,
  copy, made-up data, light and desktop, React 18 refs), where the full API lives (references, the docs URL,
  `llms-full.txt`), and how to check work (typecheck, the part's page). Under 500 lines; references hold the detail.
- [ ] Verify with a dry run: a fresh subagent given only the skill answers "build a people table with a delete
  confirmation" with correct imports and props (check against `components.json`).

### Task C4: CI, screenshots, accessibility, consumer smoke, releases, Pages

**Files:** `.github/workflows/{ci,docs,release,update-screenshots}.yml`, `apps/docs/playwright.config.ts`,
`apps/docs/e2e/{visual,a11y}.spec.ts`, `scripts/smoke/**`, `scripts/check-all.ts` (final).

- [ ] `visual.spec.ts`: one test per `exampleRoutes()` entry: open, wait for fonts (`document.fonts.ready`), run
  `meta.interact`, then `toHaveScreenshot(<id>.png, { animations: 'disabled', caret: 'hide' })` of
  `[data-example-root]` or the viewport (1280x800). Fails if the root's box is 0x0. `snapshotPathTemplate:
  '{testDir}/__screenshots__/{platform}/{arg}{ext}'`; only `linux` is committed.
- [ ] `a11y.spec.ts`: every `pageRoutes()` and `exampleRoutes()` entry (after `interact` for overlays):
  `AxeBuilder.withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'])`, expect zero violations, print the rule
  ids and targets on failure.
- [ ] `scripts/smoke/run.ts`: `npm pack -w @soleapp/ui`; copy `scripts/smoke/vite-app` to a temp folder; install the
  tarball with React 19, build with `tsc --noEmit && vite build`; assert the CSS has `--primary:#0270d6` (any case,
  minified) and `.bg-primary`, `.text-micro`, `.rounded-xl`; repeat with React 18.3.1; then `scripts/smoke/next-app`
  (Next latest, App Router, a server page rendering a client part) `next build`. `--registry <url>`: in the Vite app
  run `npx shadcn@latest add <url>/r/button.json --yes` and typecheck.
- [ ] `ci.yml` (push and PR): `check` (tokens:check, typecheck, lint, names, unit tests ui/tokens/docs, ui build,
  check:package, size-limit, docs build, check-coverage, skill rebuilt and diffed), `react18` (install `react@18.3.1
  react-dom@18.3.1` into the ui workspace without saving, run ui tests), `visual`, `a11y`, `consumer` (smoke incl.
  registry against the built docs served by `vite preview`). Node from `.nvmrc`, npm cache, Playwright `chromium` with
  deps.
- [ ] `update-screenshots.yml` (workflow_dispatch): builds, runs `visual` with `--update-snapshots`, commits the linux
  baselines to the branch it ran on.
- [ ] `docs.yml` (push to main, tags `@soleapp/ui@*`, dispatch): build, `actions/upload-pages-artifact`,
  `actions/deploy-pages`; `permissions: pages: write, id-token: write`.
- [ ] `release.yml` (push to main): `changesets/action`; when `secrets.NPM_TOKEN` is empty it runs `npx changeset
  status` and `npm publish -w @soleapp/ui --dry-run` and writes a notice "Dry run: add NPM_TOKEN to publish"; with
  the token, `publish: npx changeset publish` (with `--provenance` only if the repository is public). Add the first
  changeset: `@soleapp/ui` minor, "First release: tokens, shared and Sole HQ parts".
- [ ] `check-all.ts` runs everything `ci.yml` runs except linux screenshots (run them with `--visual` on Linux only)
  and prints a table of suites and counts.

## Task D1 (wave C, parallel): CRM parts from the Sole CRM Figma file

**Files:** `packages/ui/src/crm/**` (+ tests), extensions to shared parts named below, pages under
`apps/docs/src/content/crm/`, examples, `docs/crm-parts.md` (what was built, what was mapped to a shared part, open
questions for the owner).

Input: the orchestrator dumps the CRM 🧩 Components page (names, ids, variant properties, sizes, resolved fills and
strokes, text styles, a PNG per component set) to `docs/figma/crm-components.json` and `docs/figma/crm/*.png` before
the task starts. The builder may also read Figma itself, read only.

- [ ] Overlaps go to the shared part, HQ's look wins (spec): `Tag` → `LabelTag` (CRM hue names map gray→slate,
  blue→blue, grass→green, amber→amber, red→rose, violet→violet, sky→cyan, orange→orange, plum→pink, teal→teal; export
  `CRM_HUE: Record<CrmHue, Hue>` from `/crm`), `Filter chip` → `FilterChip` (add `field`, `operator`, `value` props
  only if the HQ API cannot render them), `Column header` → shared `ColumnHeader` (add `sort?: 'ascending' |
  'descending'` with the sort icon), `Avatar` → shared `Avatar` (add `shape?: 'circle' | 'square'`), `Property row` →
  `PropertyRow` (icon from B4), `Settings nav` → `SubNav` (icons from B4), `Toast` → the shared `Toaster`,
  `App sidebar` → the shared sidebar parts (a CRM example composes them).
- [ ] CRM-only parts in `/crm`, each matching its Figma part's sizes, colours (exact values from the dump, as tokens
  where a token exists, else CRM-local CSS custom properties in `crm/crm.css` imported by `styles.css`), states and
  variant names: `GridCell`, `TotalsCell`, `SequenceProgress` (`step`, `total`), `StageChip` (`stage: CrmStage`, the 10
  stages), `ProductBadge` (`product: 'sole' | 'practice-manager'`), `RecordChip` and `PersonName` (`type: 'person' |
  'firm'`), `TimelineItem`, `RecordBanner` (5 types, on `Banner`), `BulkActionBar`, `EligibilityRow`, `LeadRow`,
  `StepCard` (7 types, selected), `StepConnector`, `StatTile` (trend), `MergeField`, `KanbanCard`, `SendingCard` (off,
  sandbox, live), `IconTile` (11 hues, 4 sizes), `SavedViewMenu` (Figma "View switcher": a different part from HQ's
  `ViewSwitch`). Icons are `ReactNode` props; examples use lucide equivalents of the Figma Phosphor icons.
- [ ] Tests per part (variants render, roles and labels, refs), pages with every variant and the Figma node link
  (`https://www.figma.com/design/M1gnnaJXW4nyOdVTmkbxxp/?node-id=<id with - for :>`), a side-by-side check of each
  example screenshot against the Figma PNG noted in `docs/crm-parts.md` (match or the listed difference).

## Wave E: review, fixes, publish

### Task E1: Reviews

- [ ] Per task, a Sonnet first review against this plan and the spec (blocking issues fixed by the same builder).
- [ ] One Opus final review over the whole repository: spec coverage, the Global Constraints, the Review Focus, look
  fidelity (sample the screenshots against HQ's gallery captures), API consistency across entries, docs quality.
- [ ] Sonnet fixers apply the Opus findings; `node scripts/check-all.ts` green.

### Task E2: Gates for the later steps (written, not run)

**Files:** `docs/hq-migration/README.md` (merging the B task notes), `docs/dialer-migration.md`.

- [ ] Step 2 gate (Sole HQ switches to the package), as `docs/hq-migration/README.md`: (1) in sole-hq, commit the
  `app/e2e-capture` baselines from the commit before the switch, run on the same Mac; (2) freeze `app/src/components/{ui,
  sole,shell}` for the switch; (3) install `@soleapp/ui` (from npm, or `npm pack` tarball until the token exists), add
  `SoleProvider` with a react-router `Link` adapter, the Sydney time zone, HQ's app clock and `personHref`; (4) replace
  imports per the table, adapt the call sites the table lists; (5) delete the local copies; (6) run HQ's check-all and
  the capture suite: at most 0.1% of pixels differ per shot, no new aria differences; (7) only then merge.
- [ ] Step 4 gate (the Dialer), as `docs/dialer-migration.md`: inventory of `system.jsx` exports and screens mapped to
  package parts or new `/dialer` parts; prerequisites (Tailwind v4 + `@tailwindcss/vite` in the Dialer's Vite 5, React
  18.3 kept, react-router-dom 6 `Link` adapter, its phone and narrow layouts kept with touch sizes); per screen: capture
  before, move, capture after, list the visible changes, owner approves, ship.

### Task E3: Publish

- [ ] Create `mindninjaX/sole-design-system` private, push `main`. Enable Pages (`gh api -X POST
  repos/mindninjaX/sole-design-system/pages -f build_type=workflow`); if GitHub refuses Pages for a private repository
  on this plan, make the repository public (owner's OK) and enable again. Run `update-screenshots` once, then CI must be
  green on `main` and the docs live. Write the owner's npm steps (create the `soleapp` organisation on npmjs.com, a
  granular access token with publish rights to `@soleapp/*`, `gh secret set NPM_TOKEN`) in `README.md` and the report.
