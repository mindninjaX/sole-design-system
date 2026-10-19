# HQ migration notes: group hq-a

Parts that move from `HQ/components/sole/*` into `@sole-ui/react/hq`. Every file keeps its HQ name.

## Exports

| HQ import | Package import (`@sole-ui/react/hq`) |
| --- | --- |
| `StateIcon`, `STATE_GROUP_LABELS` from `@/components/sole` (`state-icon`) | `StateIcon`, `STATE_GROUP_LABELS`, `StateIconProps` |
| `StatePill` (`state-pill`) | `StatePill`, `StatePillProps` |
| `PriorityIcon` (`priority-icon`) | `PriorityIcon`, `PriorityIconProps` |
| `PropertyTypeIcon` (`property-type-icon`) | `PropertyTypeIcon`, `PropertyTypeIconProps` |
| `DueChip` (`due-chip`) | `DueChip`, `DueChipProps` |
| `ReviewBadge`, `ReviewStateBadge` (`review-badge`) | `ReviewBadge`, `ReviewStateBadge`, `ReviewBadgeProps`, `ReviewStateBadgeProps` |
| `reviewBadge`, `ReviewBadgeModel`, `reviewState`, `REVIEW_SOON_DAYS` from `@/lib/review` | same names (from `review-badge.tsx`) |
| `GroupHeader`, `GroupLabel` (`group-header`) | `GroupHeader`, `GroupLabel`, `GroupHeaderProps`, `GroupLabelProps` |
| `WorkItemRow` (`work-item-row`) | `WorkItemRow`, `WorkItemRowProps` |
| `BoardCard` (`board-card`) | `BoardCard`, `BoardCardProps` |
| `BoardChip`, `BoardEmoji` (`board-chip`) | `BoardChip`, `BoardEmoji`, `BoardChipProps`, `BoardEmojiProps` |
| `PageRow` (`page-row`) | `PageRow`, `PageRowProps` |
| `PRIORITY_LABELS` from `@/lib/activity` | `PRIORITY_LABELS` (`types.ts`) |
| `StateGroup`, `Priority`, `ReviewState`, `PropertyType`, `StickyColour` from `@shared/db` | same names (`types.ts`, plain string unions; HQ's are assignable) |
| (new) | `WorkItemSummary`, `BoardSummary` types |

## API changes, each with the HQ call site that needs it

- `WorkItemRow` and `BoardCard`: `view: WorkItemView` becomes `item: WorkItemSummary` (flat: `key`, `href`, `title`, `priority`, `state?: { name, group }`, `labels`, `dueDate`, `assignees: SolePerson[]`, `isDone`). HQ needs an adapter next to `toWorkItemView` in `data/views.ts` (`item.title`, `item.priority`, `item.due_date` -> `dueDate`, `assignees.map(toSolePerson)`). Call sites: every `<WorkItemRow view=...>` and `<BoardCard view=...>` in `features/boards` and Home.
- `WorkItemRow` and `BoardCard`: `onOpen` is now `(item: WorkItemSummary) => void`. Map back to the view with the key or href. Call sites: board list, board screen, Home, side sheet.
- `WorkItemRow` is a `SoleLink` anchor; `BoardCard`'s title uses `SoleLink`. HQ passes react-router's `Link` as `linkComponent` to `SoleProvider` once. `WorkItemRow` no longer accepts `onClick` (use `onOpen`).
- `BoardChip`: `link?: boolean` becomes `href?: string` and `board` is a `BoardSummary` (`id`, `name`, `emoji`). The chip no longer calls `boardPath(board.key)`. Call site: `features/boards/components/work-item/properties.tsx` passes `href={boardPath(board.key)}` where it linked.
- `BoardChip` and `BoardEmoji` take `emoji: string | null`, as `Board.emoji` is, so a full `Board` is assignable.
- `PageRow`: `owner` and `collaborators` are `SolePerson` (`name`, `avatarUrl`, `isBot`) instead of HQ `Person`. HQ maps with its `Person -> SolePerson` helper. Call sites: wiki lists, Pages they own. The date column reads the provider's `timeZone` (Sydney by default, as before).
- `StatePill` keeps `state={{ name, group }}`; a full HQ `State` still works.
- `DueChip`, `ReviewBadge`, `PageRow`: `today` still defaults to today on the clock, now the provider's (`useToday()` from `sole-provider.tsx`) instead of HQ's `use-now`.
- `lib/review.ts` in HQ: import `reviewState`, `REVIEW_SOON_DAYS`, `reviewBadge`, `ReviewBadgeModel` from the package and delete the local copies. `stillRightDate`, `dueSoonCutoff`, `reviewSentence` and their tests stay in HQ (they read HQ's page rows). Keep the note that `reviewState` mirrors SQL `hq.page_review_state()`.
- Every part is now `forwardRef` and spreads its remaining native props (`span`, `div`, `svg` or anchor) onto its element, which HQ's parts did not. `PriorityIcon` and `PropertyTypeIcon` refs are `SVGSVGElement`.
- `GroupHeader` and `GroupLabel` use the package `Button` (`../components/ui/button.tsx`, `size="icon-xs"`).
