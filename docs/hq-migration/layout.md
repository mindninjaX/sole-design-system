# HQ migration: layout group (plan task B4, first half)

Every part below moves from `@/components/sole` to `@sole-ui/react`. Same names, same classes and `data-*` attributes.
Every part is now `forwardRef` and passes extra props (`id`, `aria-*`, `data-*`) to its root element.

## Exports

| HQ import (`@/components/sole`) | Package import (`@sole-ui/react`) |
| --- | --- |
| `PageHeader` | `PageHeader` |
| `SectionLabel` | `SectionLabel` |
| `SectionAction` | `SectionAction` |
| `SectionCard` | `SectionCard` |
| `ListCard` | `ListCard` |
| `PropertyRow` | `PropertyRow` |
| `TableHeader` | `TableHeader` |
| `Table`, `TableRow`, `TableCell` | `Table`, `TableRow`, `TableCell` |
| `PersonCell` | `PersonCell` |
| `FilterChip`, `RemovableChip`, `SearchField`, `ViewSwitch`, `type BoardView` | same names |
| `SubNav`, `SubNavItem` | `SubNav`, `SubNavItem` |
| `ColumnHeader` (from `rows.tsx`) | `ColumnHeader` |

## API changes

- `SubNavItem`: `to` becomes `href`, `end` is removed, and `active` is now what marks the current item for links too (HQ
  used `NavLink`'s URL match when `active` was not given). A link renders the provider's `linkComponent`
  (HQ passes a react-router adapter to `SoleProvider`) with `aria-current="page"` when `active`.
  Call sites to change, each computing `active` from the URL (`useMatch` or `useLocation`):
  - `features/settings/components/settings-layout.tsx:15-16` (Profile, Password: `to` only).
  - `features/admin/pages/AdminLayout.tsx:41` (`to` only, with `className`).
  - `features/wiki/components/wiki-rail.tsx:140,153,161,176` (`to` plus `active` already: rename `to` to `href`).
- `ColumnHeader`: `group` is replaced by `icon?: ReactNode`, and the + button's name is `addLabel` (default
  `Add to ${name}`; HQ's was `New work item in ${name}`). Call site: `features/boards/components/board/board-kanban.tsx:63`
  becomes `<ColumnHeader icon={<StateIcon group={g.state.group} decorative />} addLabel={`New work item in ${name}`} ... />`.
  `components/gallery/parts-gallery.tsx:958` likewise.
- `PersonCell`: `person` is a `SolePerson` (`{ id, name, avatarUrl?, isBot? }`), not an HQ `Person`; the plain name is
  `person.name` (HQ's `displayName` fallback to the email local part must happen when HQ maps the row). Call sites:
  `features/people/pages/PeoplePage.tsx:96`, `features/admin/pages/AdminAccessPage.tsx:147`,
  `components/gallery/parts-gallery.tsx:1116,1123,1135`. `Avatar` inside takes `avatarUrl`, so HQ resolves
  `avatar_path` to a URL in its mapper.
- `PropertyRow`: new optional `icon?: ReactNode` (before the label, inside the 96px column, decorative). No HQ call site changes.
- `TableHeader`, `Table`, `TableRow`, `TableCell`, `PageHeader`, `SectionCard`, `ListCard`, `SectionLabel`, `ViewSwitch`, `SubNav`,
  `RemovableChip`: now accept the root element's props. `PeoplePage.tsx` already passes `data-person-row` to `TableRow`; that still works.
  `Table` fixes `role="table"` and sets `aria-label` from `label`; `ViewSwitch` fixes its role and label.
- Comment text that named a real staff member now reads "Assignee: Ava"; no behaviour change.
