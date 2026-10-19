# Controls (task B2): HQ -> @sole-ui/react

HQ's `@/components/ui/<name>` becomes `@sole-ui/react` (all of these are shared parts, none is in `@sole-ui/react/hq`).

| HQ import | Package import |
| --- | --- |
| `Badge, badgeVariants` from `@/components/ui/badge` | `Badge, badgeVariants` from `@sole-ui/react` |
| `Button, buttonVariants` from `@/components/ui/button` | `Button, buttonVariants` from `@sole-ui/react` |
| `Calendar, CalendarDayButton` from `@/components/ui/calendar` | `Calendar, CalendarDayButton` from `@sole-ui/react` |
| `Checkbox` from `@/components/ui/checkbox` | `Checkbox` from `@sole-ui/react` |
| `Input` from `@/components/ui/input` | `Input` from `@sole-ui/react` |
| `Label` from `@/components/ui/label` | `Label` from `@sole-ui/react` |
| `ScrollArea, ScrollBar` from `@/components/ui/scroll-area` | `ScrollArea, ScrollBar` from `@sole-ui/react` |
| `Separator` from `@/components/ui/separator` | `Separator` from `@sole-ui/react` |
| `Skeleton` from `@/components/ui/skeleton` | `Skeleton` from `@sole-ui/react` |
| `Toaster, useToastLift` from `@/components/ui/sonner` | `Toaster, useToastLift` from `@sole-ui/react` |
| `toast` from `sonner` | `toast` from `@sole-ui/react` (the package re-exports sonner's own, so HQ must switch every `toast` import or it talks to a second sonner instance) |
| `Switch` from `@/components/ui/switch` | `Switch` from `@sole-ui/react` |
| `Tabs, TabsList, TabsTrigger, TabsContent` from `@/components/ui/tabs` | same names from `@sole-ui/react` |
| `Textarea` from `@/components/ui/textarea` | `Textarea` from `@sole-ui/react` |
| `Toggle, toggleVariants` from `@/components/ui/toggle` | `Toggle, toggleVariants` from `@sole-ui/react` |
| `ToggleGroup, ToggleGroupItem` from `@/components/ui/toggle-group` | `ToggleGroup, ToggleGroupItem` from `@sole-ui/react` |

## API changes

- Every part above (except `Calendar`, `CalendarDayButton`) is now `forwardRef` with a `displayName`; a call site that passes `ref` keeps working, nothing in HQ needs to change.
- `Toaster` is `forwardRef<HTMLElement>`; the call site that mounts `<Toaster />` is unchanged.
- `Calendar` no longer defines `Root`, `Chevron` and `WeekNumber` inline: they are module-level, so the month does not remount when the parent re-renders. No HQ call site changes. `WeekNumber` also stops spreading DayPicker's `week` object onto the `<td>`.
- `Calendar` and `CalendarDayButton` do not take a `ref` (DayPicker takes none); HQ call sites do not pass one.
- `toast` is no longer exported from the sonner file: every HQ `import { toast } from 'sonner'` needs `import { toast } from '@sole-ui/react'`.
- `useToastLift` is kept as is (a plain hook): the Ask Sole panel and the Cmd J panel call sites keep `useToastLift(bottom, right)`.
