# HQ migration: group hq-b

HQ source: `app/src/components/sole/`. Package entry: `@sole-ui/react/hq`. Every part below is a `forwardRef` part that
passes its remaining props to its root element; `now` falls back to the provider's clock, links go through `SoleLink`.

## Exports

| HQ import | Package import |
| --- | --- |
| `InboxRow` from `@/components/sole` (`inbox-row.tsx`) | `InboxRow`, `InboxRowProps` from `@sole-ui/react/hq` |
| `ActivityLine` from `@/components/sole` (`activity-line.tsx`) | `ActivityLine`, `ActivityLineProps`, `ActivityKind` |
| `Comment` from `@/components/sole` (`comment.tsx`) | `Comment`, `CommentProps` |
| `Sticky` from `@/components/sole` (`cards.tsx`) | `Sticky`, `StickyProps`, `StickyColour` |
| `TemplateCard` from `@/components/sole` (`cards.tsx`) | `TemplateCard`, `TemplateCardProps` |
| `MentionChip` from `@/components/sole/cards` | `MentionChip`, `MentionChipProps` |
| `CitationChip` from `@/components/sole/cards` | `CitationChip`, `CitationChipProps` |
| `ChecklistItem` from `@/components/sole` (`rows.tsx`) | `ChecklistItem`, `ChecklistItemProps` |
| `LinkRow` from `@/components/sole` (`rows.tsx`) | `LinkRow`, `LinkRowProps` |
| `RecentItem` from `@/components/sole` (`rows.tsx`) | `RecentItem`, `RecentItemProps` |

`ColumnHeader` (also in HQ `rows.tsx`) is not in this group.

## API changes, with the HQ call site that needs each

- `InboxRow`: `notification` is split into props. `notification.summary` -> `summary`, `detail ?? notification.subject_title` -> `detail`
  (now required), `notification.created_at` -> `at`, `!notification.read_at` -> `unread`, `notification.id` -> `notificationId`
  (still written to `data-inbox-row`, which `features/inbox/inbox.test.tsx` selects on). Call site: `components/gallery/parts-gallery.tsx`
  (the only user; `features/inbox/components/inbox-entry.tsx` draws its own row).
- `InboxRow`: the link target is a prop, `to={notificationHref(notification)}` -> `href={notificationHref(notification)}`; `onOpen(notification)` is
  now the anchor's `onClick`. Same call site.
- `InboxRow`, `Comment`: `actor` and `author` are `SolePerson | null | undefined` (`full_name` -> `name`, `is_bot` -> `isBot`), mapped by HQ's `data/views.ts`.
- `ActivityLine`: takes the sentence as `children` and `at` (was `activity.created_at`); HQ calls `describeActivity(activity, ...)` itself and passes
  `kind` (its `ActivityKind`, now exported from the package) to pick the icon, so `activity`, `fromSlack` and `today` props go. Call site:
  `components/gallery/parts-gallery.tsx` line 848.
- `ActivityLine`: `actor` is optional and draws nothing (the sentence names them); the id is kept as `data-actor`.
- `Comment`: `tz` defaults to the provider's `timeZone` (was `SYDNEY`). Call site: `components/comments/comment-item.tsx` line 83 passes `tz` and `now`, which still work.
- `Comment`: spreads its remaining props onto the `<article>`; the ref is an `HTMLElement`.
- `Sticky`: `StickyColour` is exported from the package (was `@shared/db`). Call sites: `features/home/components/stickies.tsx`
  (it also keeps its own `COLOUR_NAMES: Record<StickyColour, string>`; import the type from the package).
- `MentionChip`: `person` is a `SolePerson`; former-member text comes from the package. Call sites: `components/editor/rich-text-editor.tsx` line 110,
  `components/editor/doc-view.tsx` line 145 (map the HQ `Person` with the same mapper as for avatars).
- `CitationChip`: the ref is an `HTMLElement` (it renders an `a`, a `button` or a `span`). No call-site change (`components/ask/ask-answer.tsx`).
- `LinkRow`, `RecentItem`: react-router `Link` -> `SoleLink`; the provider's `linkComponent` must be react-router's `Link` adapted to `href`.
  `href` is unchanged. Call sites: `features/boards/components/work-item/links.tsx` line 113, `features/home/components/recently-viewed.tsx` line 21.
- `ChecklistItem`: no change except that `Checkbox` is the package's. No call-site change.
- `TemplateCard`: no change. Call site: `features/wiki/components/new-page-dialog.tsx` line 156.
- `LinkRow`, `ChecklistItem`, `MentionChip`, `CitationChip`, `InboxRow`: now accept the root element's own props (`data-*`, `aria-*`, `id`), which HQ did not (`Sticky` and `TemplateCard` already did).
