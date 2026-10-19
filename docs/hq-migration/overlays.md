# HQ migration notes: overlays (task B1)

HQ imports `@/components/ui/<file>`; the package exports the same names from `@sole-ui/react`. Every export keeps its name.

| HQ import | Package import |
| --- | --- |
| `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger` from `@/components/ui/alert-dialog` | same names from `@sole-ui/react` |
| `Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator` from `@/components/ui/command` | same names from `@sole-ui/react` |
| `Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger` from `@/components/ui/dialog` | same names from `@sole-ui/react` |
| `DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent` from `@/components/ui/dropdown-menu` | same names from `@sole-ui/react` |
| `Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverHeader, PopoverTitle, PopoverDescription` from `@/components/ui/popover` | same names from `@sole-ui/react` |
| `Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue` from `@/components/ui/select` | same names from `@sole-ui/react` |
| `Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription` from `@/components/ui/sheet` | same names from `@sole-ui/react` |
| `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` from `@/components/ui/tooltip` | same names from `@sole-ui/react` |

## API changes

- Every part that renders an element or a Radix content part is now `forwardRef` with a `displayName`. Nothing to change at a call site; `ref` now works on them (also on React 18).
- `PopoverTitle`: props are now a div's (`React.ComponentPropsWithoutRef<'div'>`), not an h2's. HQ rendered a div already; a call site passing h2-only props to `PopoverTitle` would no longer typecheck (none found in HQ).
- `CommandDialog`, `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `DropdownMenu`, `DropdownMenuSub`, `Select`, `Tooltip`, `TooltipProvider`, and the `*Portal` parts render no element, so they take no ref (as in HQ).
- `CommandInput`'s ref points at the `<input>`, not at the wrapper div around the search icon.
- `TooltipProvider`: HQ `app/App.tsx` (delay 400) and `test/render.tsx` (delay 0) wrap the tree in it. `SoleProvider` already wraps its children in a Radix tooltip provider (delay 400), so HQ's `App.tsx` can drop its own `TooltipProvider` once it uses `SoleProvider`; HQ's `test/render.tsx` should pass its delay-0 provider inside `SoleProvider` (the nearest provider wins) or keep it as is.
- Imports: `@/lib/utils` `cn` is `cn` from the package (`lib/cn.ts`, with the Sole type scale registered); `@/components/ui/button` is the package's `Button`.
- Added `'use client';` to `dialog.tsx`, `dropdown-menu.tsx` and `tooltip.tsx` (HQ had none).
- Kept as in HQ: `CommandDialog` renders its sr-only title and description beside `DialogContent`, not inside it, so a closed palette leaves them in the page. Call site: `app/src/components/shell/command-palette.tsx`.
