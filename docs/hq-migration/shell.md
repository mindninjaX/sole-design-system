# Shell (page, sidebar, app frame, command palette)

All imports are from `@sole-ui/react`. HQ keeps its data-wired shell (`app-shell.tsx`, the sidebar's nav and boards data,
the data-wired `command-palette.tsx`, the new work item dialog, the shortcuts sheet) and builds it from these parts.

| HQ import | Package import |
| --- | --- |
| `Breadcrumbs`, `TopBar`, `Crumb` from `@/components/shell/page` | `Breadcrumbs`, `TopBar`, `Crumb` |
| `Page` from `@/components/shell/page` | `Page` (HQ keeps `useDocumentTitle` in its own `Page` wrapper) |
| `Sidebar` from `@/components/shell/sidebar` | `Sidebar` plus `SidebarHeader`, `SidebarSection`, `SidebarContent`, `SidebarFooter` |
| `NavItem`, board rows (inside `sidebar.tsx`) | `SidebarItem` |
| `BoardsGroup` (inside `sidebar.tsx`) | `SidebarGroup` |
| `UserMenu` (inside `sidebar.tsx`) | `SidebarUser` |
| the Search button (inside `sidebar.tsx`) | `SidebarSearch` |
| the layout div and `<main>` of `AppShell` | `AppFrame` |
| the frame of `CommandPalette` | `CommandPalette` (new rows-as-props palette; HQ's server-search one stays on `CommandDialog`) |

## API changes

- `Crumb.to` -> `Crumb.href` (and links go through `SoleLink`): `settings-layout.tsx`, `AdminLayout.tsx`, `WikiDocPage.tsx`, `PersonPage.tsx`.
- `Page` has no `title`: HQ's wrapper calls `useDocumentTitle(title)` and passes `crumbs` (default `[{ label: title }]`) to the package's `Page`. Every `<Page title=...>` call site goes through that wrapper.
- `Page` takes `crumbs` as required; `className` still styles the scrolling body, as in HQ (`board-screen.tsx`, `BoardPage.tsx`, `WikiDocPage.tsx`).
- `Sidebar` takes children: HQ composes the lockup, search, New work item, `MAIN_NAV`, the Boards group and the user menu itself, from `useAuth`, `useUi`, `useUnreadCounts` and `useWorkBoards`. `onExpand` becomes `SidebarHeader onToggle` (`app-shell.tsx`).
- `rail` is set once on `Sidebar` and read by every part inside; a part's own `rail` still wins (HQ passes it explicitly today, which keeps working).
- `SidebarItem.icon` is an element (`<Icon />`), not a component: `entry.icon` becomes `<entry.icon />`; a board's emoji passes as its icon (`BoardsGroup`). Stroke is 1.8, or 2.1 when `active`, set by CSS.
- `SidebarItem` needs the caller to say `active` (HQ computed it from `useLocation` and `entry.matches`) and to pass `badge={{ text, label }}` from `inboxBadge(...)` and the rail's words as `hint` from `railInboxHint(...)`; `entry.keys` -> `shortcut`.
- Extra props pass through to the row (`data-nav`, `data-nav-board`, `onPointerEnter`, `onFocus`, `aria-keyshortcuts`): the Boards rows' lazy open count uses `onPointerEnter`/`onFocus` and `trailing` (`BoardOpenCount`, shown with `group-hover/nav:opacity-100`; the row's group name is `nav`, not HQ's `board`).
- New work item row: `SidebarItem onClick` with `trailing={<Kbd keys={['C']} />}` (the key stays visible, as in HQ).
- `SidebarGroup` is for any group: `label`, `open`/`onOpenChange` (HQ's `readStorage`/`writeStorage` of `boardsGroupOpen` stays in HQ and drives `open`); add `data-nav-group="boards"` as a prop (e2e reads it).
- `SidebarUser` takes `person: SolePerson` (`displayName(me.person)` -> `personName`), `meta` ("Admin" or "Member"), and the menu rows as children; the name label heads the menu. The rows (profile, password, shortcuts, sign out, with `navigate` and `signOut`) stay in HQ.
- `AppFrame({ sidebar, aside, banner, children })`: `<DemoBanner />` -> `banner` (the panel loses its top gap when a banner is shown, as `LIVE && 'pt-2'` did); `<AskPanel />` -> `aside`; `BESIDE_ASK` -> `contentClassName`; `data-beside-ask` -> `data-has-aside` (nothing in HQ's tests or e2e reads it). Pass `className="h-full"` to override the `h-dvh`.
- `CommandPalette` takes `groups`, `open`, `onOpenChange`; selecting a row closes the palette first, then calls its `onSelect`. It filters by label (case-insensitive, as HQ's screens list does); `filter={false}` with `query`/`onQueryChange` is for a palette that searches a server. HQ's own palette (controlled highlight, error and status lines, "Ask Sole" row) is not expressible with it and keeps using `CommandDialog` directly.
