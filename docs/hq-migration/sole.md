# HQ migration: Sole parts (task B3)

Package imports are all from `@sole-ui/react`. HQ's `@/components/sole` import path stays for the parts that did not move.

## Exports

| HQ import | Package import |
| --- | --- |
| `Avatar`, `AvatarStack`, `type AvatarSize` from `@/components/sole` | same names from `@sole-ui/react` |
| `PersonChip` | `PersonChip` |
| `PersonHeader`, `AvatarRow` | same |
| `Kbd`, `keysText` | same |
| `CountBadge` | `CountBadge` |
| `Pill`, `type PillTone` | same |
| `Banner`, `InlineError`, `InlineSuccess`, `type BannerTone` | same |
| `Field`, `ReadOnlyField` | same |
| `CopyField` | `CopyField` |
| `CenteredState`, `EmptyState`, `ErrorState`, `NoAccess`, `SkeletonRows`, `useDelayed` | same |
| `LabelTag`, `LabelTags` | same |
| `SoleMark`, `SoleLockup` | same |

New, additive: the `*Props` interfaces (`AvatarProps`, `PersonChipProps`, `PillProps` and so on, one per part).

## API changes

- People are `SolePerson` (`{ id, name, avatarUrl?, isBot? }`), not HQ's `Person`. Every HQ call site maps `full_name`/`email` to `name`
  (HQ's `displayName(person)` result), `avatar_path` to `avatarUrl` (HQ's `avatarUrl(path)` result, or null) and `is_bot` to `isBot`:
  `Avatar`, `AvatarStack`, `PersonChip`, `PersonHeader`, `AvatarRow` (everywhere HQ passes a `Person`, for example `WorkItemRow`, `Comment`, `PersonCell`).
- `Avatar` no longer calls HQ's `avatarUrl()` (local blob lookup): HQ resolves the address first and passes `avatarUrl`.
- `AvatarSize` is `16 | 20 | 24 | 32 | 40 | 48 | 64` (was `16 | 20 | 24 | 32 | 64`). Sizes are a superset, so no call site changes.
- `PersonChip` links through the provider: wrap the app in `<SoleProvider linkComponent={RouterLink} personHref={(p) => '/people/' + p.id}>`
  (HQ's `app-frame` root). It no longer imports react-router; without `personHref` it is plain text. `link={false}` still turns the link off.
- `Hue` for `LabelTag`/`LabelTags` comes from the package (`import { type Hue } from '@sole-ui/react'`) instead of `@shared/db`; the 12 names are the same, so the type is structurally identical. Call sites: `LabelTags` in `WorkItemRow`, label pickers.
- `Kbd` and `keysText` accept `readonly string[]` (was `string[]`): wider, no call site change.
- Every part now forwards its ref and spreads the rest of the HTML props on its outer element (so a part works inside `<TooltipTrigger asChild>`). `PersonChip`'s ref is the link when it links and a span otherwise.
- `SoleMark` carries the mark inline (a data: address of HQ's `public/mark.png`) instead of `<img src="/mark.png">`. Pass `src="/mark.png"` to keep HQ's file.
  `SoleMark` accepts `src` and other `<img>` attributes (`alt` stays `""` unless set).
- `SoleLockup` takes `name` (default `"Sole HQ"`, so HQ is unchanged); other tools pass their own.
- `ErrorState`/`EmptyState` `title` and `AvatarRow` `title` are no longer applied as an HTML `title` attribute (they never were); the types now omit the HTML one.
- `Field`'s `id` prop is the control's id as before, not the wrapper's.
