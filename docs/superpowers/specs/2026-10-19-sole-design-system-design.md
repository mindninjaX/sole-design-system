# Sole design system: design

19 Oct 2026 · Owner: Rishabh Singh · Status: for approval

## Why

Sole runs three internal tools: Sole HQ (live), Sole CRM (designed, front end not built) and the Dialer (live, on its
own hand-made design system). Each one has so far invented its own parts. One system means a new
tool starts from an install and a docs site, every tool looks and behaves like Sole, and a change to a part is made once.

## Goals

1. **One package** that any Sole front end installs to get the Sole look and every component, shared and
   product-specific, typed and tested.
2. **One documentation site** on GitHub Pages that a designer, a developer and an agent can each work from: what a part
   is for, when to use it, every variant live, its props, its Figma link, copy and accessibility rules.
3. **Zero visual change** when Sole HQ moves onto the package (checked by the screenshot suite built during the Figma
   audit), and the Dialer moved onto it without losing anything it does today.

Non-goals: dark mode, mobile layouts (Sole's tools are light mode, desktop only), a Figma plugin, server code.
Anti-goals (a failure even if it works): a component that looks different from its Figma part; a docs page that drifts
from the code; a product forking a shared part instead of extending it.

## What exists today

| Product | Front end | Parts |
| --- | --- | --- |
| Sole HQ | Vite, React 19, TypeScript, Tailwind v4, shadcn (new-york, radix-ui), lucide, sonner, cmdk | 25 shadcn parts customised to Sole tokens (`app/src/components/ui`), 34 Sole parts (`components/sole`), shell, ask, comments, pickers, editor. A parts gallery at `/__parts` and a full screenshot suite |
| Sole CRM | none yet (engine and Supabase only) | Designed in Figma on the sitsiilia shadcn kit: Stage chip, Record chip, Product badge, Grid cell, Column header, Filter chip, View switcher, Sequence progress and builder, Tag, settings nav, identity parts |
| Dialer | Vite, React, JSX, its own `design/system.jsx` with inline styles | Its own chips, rows, call and support patterns; same font and blue family |

Figma: each product keeps its own file in Sole CRM's three-page shape, on the shadcn kit in its `Sole` mode, with its own
components page. The docs link every part to its Figma node.

## The system (my calls unless marked)

**One look.** The `Sole` theme everywhere: the tokens in Sole HQ's `globals.css` (blue `#0270D6`, zinc greys, Inter
13/20, radius 8). Owner decision, 18 Oct.

**One repository**, `sole-design-system`, on GitHub (owner decision: "my GH", account mindninjaX), npm workspaces:

| Path | What |
| --- | --- |
| `packages/ui` | The package. Entry points: `styles.css` (tokens, Tailwind v4 `@theme`, base, Inter), the shared components, and one entry per product: `/hq`, `/crm`, `/dialer` |
| `packages/tokens` | The tokens as DTCG JSON plus CSS, generated from one source, so Figma variables and code can be checked against each other |
| `apps/docs` | The documentation site |
| `skills/sole-design-system` | A Claude skill that answers "how do I build X with Sole's system", like the sitsiilia skill does for the kit |

**Components.** Start from the code that already works: Sole HQ's 25 customised shadcn parts and its Sole parts move
into the package with their tests, unchanged in behaviour and look. Parts used by more than one product sit in the shared
entry (button, field, dialog, menu, table, avatar, person chip, pill, kbd, count badge, banner, empty and error states,
toast, command palette, app shell and sidebar, page header). Parts only one product uses sit in that product's entry
(HQ: work item row, board card, state and priority icons, due chip, review badge, page row, inbox row, Ask answer...).
CRM's parts are built in code from its Figma components. The Dialer's parts are rebuilt on the system from its
`system.jsx` and screens. Each component keeps shadcn's API shape and `data-slot` names.

**Documentation site** (Vite, React, MDX, static, deployed to GitHub Pages by GitHub Actions):

- Foundations: colour, type, spacing, radius, elevation, icons, motion, copy rules, demo data rules.
- One page per component: what it is for and when not to use it, every variant rendered live from the package, props
  table generated from the TypeScript types, the import line and a copyable example, states (loading, empty, error,
  disabled), keyboard and accessibility notes, the Figma link, and which products use it.
- Patterns: forms, tables and lists, dialogs and confirmations, toasts, empty and loading states, keyboard shortcuts.
- Per product: its screens and the parts they use.
- For agents: `llms.txt`, `llms-full.txt`, every page also served as Markdown, a `components.json` manifest (name,
  import, props, variants, Figma link) and a shadcn-compatible registry, so `npx shadcn add <url>` also works.

**Quality gates** in CI on every change: TypeScript strict, lint, unit tests (Vitest, Testing Library), a screenshot of
every variant compared with the last approved one (Playwright), an accessibility check of every docs page (axe), a size
budget for the package. Releases with Changesets; a tagged release publishes the package and redeploys the docs.

## Order of work

1. Repository, tokens, the shared and HQ parts moved over with their tests, the docs site with those pages, the agent
   files. First release.
2. Sole HQ installs the package and drops its local copies; the screenshot suite must show no difference.
3. CRM parts built from its Figma file and documented (ready before CRM's front end starts).
4. Dialer: inventory of its parts and screens, then its parts rebuilt on the system and the Dialer moved over screen
   by screen, each screen checked against its current look and behaviour.
5. Any new internal tool starts from a template that already has the package, the shell and the docs links.

Steps 3 and 4 can run in parallel with step 2. Each step: Opus plans, Sonnet builds and does first reviews, Opus does
one final review, Sonnet fixes (or Haiku where the model test shows it holds up).

## Settled after the builder check (my calls, for the owner to check)

- **The package is presentational.** Components take data as props and slots, links through a `linkComponent` prop or
  provider (react-router in HQ, the Dialer's router, Next's `Link`), people as one neutral shape (`id`, `name`,
  `avatarUrl`). Sole HQ keeps its data wiring (shell data hooks, Ask, comments, pickers) and composes package parts.
  The tiptap editor stays in HQ for the first release.
- **Peers:** React `^18.3 || ^19` (refs written to work on both, so the Dialer does not need a React upgrade first),
  radix-ui, Tailwind v4. Works in Vite and Next (`"use client"` where needed; Tailwind `@source` documented for both).
- **The Dialer keeps its phone and narrow layouts.** "Desktop only" is HQ's and CRM's rule; shared parts get touch sizes
  where the Dialer uses them. The Dialer moves to the Sole look (owner, 18 Oct: one look everywhere, which supersedes the
  "do not restyle" note in its `system.jsx`); each screen's visible changes are listed and approved before it ships.
- **Code wins over Figma today.** The Sole HQ Figma rebuild (in progress) brings Figma level with the app; docs link to
  the rebuilt file (`RnRT8ThBzyTmynmrCUmzFl`) and to Sole CRM's (`M1gnnaJXW4nyOdVTmkbxxp`).
- **The zero-change gate:** HQ's screenshot suite (`app/e2e-capture`) is committed with baselines taken from the commit
  before the switch, run on the same Mac before and after, tolerance 0.1% of pixels. HQ's component folders are frozen
  for the day or two the switch takes.
- **CRM's front end uses HQ's stack** (Vite, React 19, TypeScript, Tailwind v4) unless its builders say otherwise. Where
  a CRM part overlaps an HQ part (tag, filter chip, view switch, column header) there is one shared part, HQ's current
  look wins, and the CRM Figma part is updated to match.

## Left to the builder

Internal file layout, build tool for the package (tsup or Vite library mode), docs theme details within the Sole look,
test naming.

## Scope and publishing (owner, 19 Oct)

- **Academy is out of scope for now.** The existing Academy (`~/Projects/academy`, SPM's customer-facing training centre
  on SPM's own look) is not touched.
- **Repository and docs on the owner's GitHub (mindninjaX).** Private if GitHub Pages can publish from it on this
  account; if Pages needs a public repository, it is public (owner's OK). A GitHub Pages site can be opened by anyone
  with its address either way, so the docs use realistic but made-up people and data, never real staff names or emails.
- **The package goes on the npm registry** (npmjs.com) as `@soleapp/ui`, public: public packages are free there, private
  ones need a paid npm organisation. The owner creates the free npm organisation `soleapp` and puts its publish token in
  the repository's secrets; until then releases run as dry runs.
