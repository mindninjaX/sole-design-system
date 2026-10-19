import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@sole-ui/react';
import { useState } from 'react';
import { firms } from '../demo/people.ts';
import { Row, Stage } from '../doc.tsx';
import type { DocSection } from '../doc.tsx';

const SIDES = ['top', 'right', 'bottom', 'left'] as const;

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

function AlertDialogExample({ size }: { size: 'default' | 'sm' }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">{size === 'sm' ? 'Delete (small)' : 'Delete board'}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent size={size}>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <WarningIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete the Payroll board?</AlertDialogTitle>
          <AlertDialogDescription>Its 12 work items are deleted too. This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete board</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DialogExample({ closeButton }: { closeButton: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{closeButton ? 'Invite someone' : 'No corner button'}</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={closeButton}>
        <DialogHeader>
          <DialogTitle>Invite someone</DialogTitle>
          <DialogDescription>They get an email with a link to join {firms[0]}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor={`invite-email-${closeButton}`}>Email</Label>
          <Input id={`invite-email-${closeButton}`} type="email" placeholder="name@example.com" />
        </div>
        <DialogFooter showCloseButton={!closeButton}>
          {closeButton && (
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          )}
          <Button>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SheetExample({ side }: { side: (typeof SIDES)[number] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">From the {side}</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>ENG-12</SheetTitle>
          <SheetDescription>Fix the invoice export for {firms[1]}.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function MenuExample() {
  const [showDone, setShowDone] = useState(true);
  const [sort, setSort] = useState('newest');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Work item</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Rename <DropdownMenuShortcut>R</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuItem inset>Inset item</DropdownMenuItem>
          <DropdownMenuItem disabled>Archive</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showDone} onCheckedChange={setShowDone}>
          Show done
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Move to board</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Engineering</DropdownMenuItem>
            <DropdownMenuItem>Customer success</DropdownMenuItem>
            <DropdownMenuItem>Payroll</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SelectExample({ size, position }: { size: 'default' | 'sm'; position: 'item-aligned' | 'popper' }) {
  return (
    <Select>
      <SelectTrigger size={size} className="w-48" aria-label="Board">
        <SelectValue placeholder="Pick a board" />
      </SelectTrigger>
      <SelectContent position={position}>
        <SelectGroup>
          <SelectLabel>Teams</SelectLabel>
          <SelectItem value="eng">Engineering</SelectItem>
          <SelectItem value="cs">Customer success</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Finance</SelectLabel>
          <SelectItem value="pay">Payroll</SelectItem>
          <SelectItem value="old" disabled>
            Archived
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function CommandItems() {
  return (
    <>
      <CommandInput placeholder="Search or jump to" />
      <CommandList>
        <CommandEmpty>No match.</CommandEmpty>
        <CommandGroup heading="Go to">
          <CommandItem>
            Home <CommandShortcut>G H</CommandShortcut>
          </CommandItem>
          <CommandItem>
            Boards <CommandShortcut>G B</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="People">
          <CommandItem>Ava Thompson</CommandItem>
          <CommandItem>Noah Patel</CommandItem>
          <CommandItem disabled>Mia Rossi</CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

function CommandDialogExample({ custom }: { custom?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {custom ? 'Custom footer' : 'Open the palette'}
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        footer={custom ? <div className="flex h-9 items-center border-t border-border bg-muted px-3.5 text-label text-subtle-foreground">Your own hint</div> : undefined}
      >
        <CommandItems />
      </CommandDialog>
    </>
  );
}

export const sections: DocSection[] = [
  {
    id: 'alert-dialog',
    title: 'AlertDialog',
    group: 'Shared',
    summary: 'A confirmation that stops the page until the person answers. Use it before something that cannot be undone.',
    importLine: "import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Default size">
          <AlertDialogExample size="default" />
        </Row>
        <Row label="Small (sm)">
          <AlertDialogExample size="sm" />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'command',
    title: 'Command',
    group: 'Shared',
    summary: 'A searchable list. CommandDialog puts it in a palette, anchored near the top, with a footer that names the keys.',
    importLine: "import { Command, CommandDialog, CommandInput, CommandList, CommandItem } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Command list">
          <div className="w-full max-w-[420px] overflow-hidden rounded-xl border border-border">
            <Command>
              <CommandItems />
            </Command>
          </div>
        </Row>
        <Row label="CommandDialog">
          <CommandDialogExample />
          <CommandDialogExample custom />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'dialog',
    title: 'Dialog',
    group: 'Shared',
    summary: 'A window over the page for a short task, such as a form. Sits a little above the middle of the window.',
    importLine: "import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="With close button">
          <DialogExample closeButton />
        </Row>
        <Row label="No close button">
          <DialogExample closeButton={false} />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'dropdown-menu',
    title: 'DropdownMenu',
    group: 'Shared',
    summary: 'A menu of actions that opens from a button. Items can be checkboxes, radios or a sub-menu; a red item is destructive.',
    importLine: "import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Items, checkbox, radio, sub-menu">
          <MenuExample />
        </Row>
      </Stage>
    ),
  },
  {
    id: 'popover',
    title: 'Popover',
    group: 'Shared',
    summary: 'A small panel that opens beside its trigger, for settings or a short form that does not need the whole page.',
    importLine: "import { Popover, PopoverTrigger, PopoverContent } from '@sole-ui/react'",
    render: () => (
      <Stage>
        {(['start', 'center', 'end'] as const).map((align) => (
          <Row key={align} label={`align ${align}`}>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Filters</Button>
              </PopoverTrigger>
              <PopoverContent align={align}>
                <PopoverHeader>
                  <PopoverTitle>Filter by board</PopoverTitle>
                  <PopoverDescription>Pick one or more boards to show.</PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </Row>
        ))}
      </Stage>
    ),
  },
  {
    id: 'select',
    title: 'Select',
    group: 'Shared',
    summary: 'A list of options in a popup, for choosing one value. Options can be grouped, and a trigger comes in two heights.',
    importLine: "import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="Default (32px)">
          <SelectExample size="default" position="item-aligned" />
        </Row>
        <Row label="Small (28px)">
          <SelectExample size="sm" position="item-aligned" />
        </Row>
        <Row label="Popper position">
          <SelectExample size="default" position="popper" />
        </Row>
        <Row label="Disabled">
          <Select disabled>
            <SelectTrigger className="w-48" aria-label="Board (disabled)">
              <SelectValue placeholder="Pick a board" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eng">Engineering</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Invalid">
          <Select>
            <SelectTrigger className="w-48" aria-label="Board (invalid)" aria-invalid>
              <SelectValue placeholder="Pick a board" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eng">Engineering</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Stage>
    ),
  },
  {
    id: 'sheet',
    title: 'Sheet',
    group: 'Shared',
    summary: 'A panel that slides in from an edge of the window and leaves the page behind it undimmed. Use it for a detail view.',
    importLine: "import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="side">
          {SIDES.map((side) => (
            <SheetExample key={side} side={side} />
          ))}
        </Row>
      </Stage>
    ),
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    group: 'Shared',
    summary: 'A short label that appears when a control is hovered or focused. SoleProvider already provides the delay.',
    importLine: "import { Tooltip, TooltipTrigger, TooltipContent } from '@sole-ui/react'",
    render: () => (
      <Stage>
        <Row label="side">
          {SIDES.map((side) => (
            <Tooltip key={side}>
              <TooltipTrigger asChild>
                <Button variant="outline">{side}</Button>
              </TooltipTrigger>
              <TooltipContent side={side}>Shown on the {side}</TooltipContent>
            </Tooltip>
          ))}
        </Row>
      </Stage>
    ),
  },
];
