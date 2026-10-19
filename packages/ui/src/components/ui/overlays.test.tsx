import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderUi } from '../../../test/render.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog.tsx';
import { Button } from './button.tsx';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog.tsx';
import {
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
} from './dropdown-menu.tsx';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './popover.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select.tsx';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip.tsx';
import * as alertDialogModule from './alert-dialog.tsx';
import * as commandModule from './command.tsx';
import * as dialogModule from './dialog.tsx';
import * as dropdownModule from './dropdown-menu.tsx';
import * as popoverModule from './popover.tsx';
import * as selectModule from './select.tsx';
import * as sheetModule from './sheet.tsx';
import * as tooltipModule from './tooltip.tsx';

describe('Dialog', () => {
  function Example({ onConfirm }: { onConfirm?: () => void }) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Invite someone</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite someone</DialogTitle>
            <DialogDescription>They get an email from Sole.</DialogDescription>
          </DialogHeader>
          <input aria-label="Email" defaultValue="ava@example.com" />
          <DialogFooter showCloseButton>
            <Button onClick={onConfirm}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  it('opens from its trigger and closes with the close button', async () => {
    const user = userEvent.setup();
    renderUi(<Example />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Invite someone' }));
    const dialog = await screen.findByRole('dialog', { name: 'Invite someone' });
    expect(dialog).toHaveAttribute('data-slot', 'dialog-content');
    expect(within(dialog).getByText('They get an email from Sole.')).toBeInTheDocument();
    await user.click(within(dialog).getAllByRole('button', { name: 'Close' })[0]!);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes on Escape and from the footer Close button', async () => {
    const user = userEvent.setup();
    renderUi(<Example />);
    await user.click(screen.getByRole('button', { name: 'Invite someone' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Invite someone' }));
    const dialog = await screen.findByRole('dialog');
    const footer = dialog.querySelector('[data-slot="dialog-footer"]') as HTMLElement;
    await user.click(within(footer).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('leaves out the corner close button when asked', async () => {
    renderUi(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Plain</DialogTitle>
          <DialogDescription>No corner button.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });
});

describe('AlertDialog', () => {
  it('asks first, runs the action only on confirm, and closes either way', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderUi(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete board</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete the Payroll board?</AlertDialogTitle>
            <AlertDialogDescription>Its 12 work items go with it.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Delete board' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete the Payroll board?' });
    expect(dialog).toHaveAttribute('data-size', 'default');
    await user.click(within(dialog).getByRole('button', { name: 'Keep it' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete board' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('takes the small size and a media slot', async () => {
    renderUi(
      <AlertDialog open>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>!</AlertDialogMedia>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>You can sign back in at any time.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveAttribute('data-size', 'sm');
    expect(dialog.querySelector('[data-slot="alert-dialog-media"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toHaveAttribute('data-slot', 'alert-dialog-action');
    expect(screen.getByRole('button', { name: 'Stay' })).toHaveAttribute('data-variant', 'outline');
  });
});

describe('Sheet', () => {
  it('opens from its trigger and closes with the close button', async () => {
    const user = userEvent.setup();
    renderUi(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open item</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>ENG-12</SheetTitle>
            <SheetDescription>Fix the invoice export.</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Done</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    await user.click(screen.getByRole('button', { name: 'Open item' }));
    const sheet = await screen.findByRole('dialog', { name: 'ENG-12' });
    expect(sheet).toHaveAttribute('data-slot', 'sheet-content');
    expect(sheet.className).toContain('right-0');
    await user.click(within(sheet).getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it.each(['top', 'bottom', 'left'] as const)('puts the sheet on the %s', async (side) => {
    renderUi(
      <Sheet open>
        <SheetContent side={side}>
          <SheetTitle>Side</SheetTitle>
          <SheetDescription>A side sheet.</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    const sheet = await screen.findByRole('dialog');
    expect(sheet.className).toContain(`slide-in-from-${side}`);
  });
});

describe('Popover', () => {
  it('opens from its trigger and closes on Escape', async () => {
    const user = userEvent.setup();
    renderUi(
      <Popover>
        <PopoverTrigger>Filters</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Filter by board</PopoverTitle>
            <PopoverDescription>Pick one or more boards.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    const content = await screen.findByRole('dialog');
    expect(content).toHaveAttribute('data-slot', 'popover-content');
    expect(within(content).getByText('Filter by board')).toHaveAttribute('data-slot', 'popover-title');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens against an anchor that is not the trigger', async () => {
    const user = userEvent.setup();
    renderUi(
      <Popover>
        <PopoverAnchor>
          <span>Anchor</span>
        </PopoverAnchor>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Anchored content</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('Anchored content')).toBeInTheDocument();
  });
});

describe('DropdownMenu', () => {
  function Example({ onRename, onChecked }: { onRename?: () => void; onChecked?: (v: boolean) => void }) {
    const [sort, setSort] = useState('newest');
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Item</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={onRename}>
              Rename <DropdownMenuShortcut>R</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Archive</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked onCheckedChange={onChecked}>
            Show done
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Engineering</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  it('opens, runs an item and closes', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    renderUi(<Example onRename={onRename} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAttribute('data-slot', 'dropdown-menu-content');
    expect(within(menu).getByRole('menuitem', { name: /Archive/ })).toHaveAttribute('data-disabled');
    expect(within(menu).getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-variant', 'destructive');
    await user.click(within(menu).getByRole('menuitem', { name: /Rename/ }));
    expect(onRename).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('toggles a checkbox item and moves a radio selection', async () => {
    const user = userEvent.setup();
    const onChecked = vi.fn();
    renderUi(<Example onChecked={onChecked} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(await screen.findByRole('menuitemcheckbox', { name: 'Show done' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Newest' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemradio', { name: 'Oldest' }));
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(await screen.findByRole('menuitemradio', { name: 'Oldest' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Show done' }));
    expect(onChecked).toHaveBeenCalledWith(false);
  });

  it('opens a sub-menu with the keyboard and closes on Escape', async () => {
    const user = userEvent.setup();
    renderUi(<Example />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    const subTrigger = await screen.findByRole('menuitem', { name: 'Move to' });
    expect(subTrigger).toHaveAttribute('data-slot', 'dropdown-menu-sub-trigger');
    subTrigger.focus();
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByRole('menuitem', { name: 'Engineering' })).toBeInTheDocument();
    await user.keyboard('{Escape}{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});

describe('Select', () => {
  function Example({ onChange }: { onChange?: (v: string) => void }) {
    return (
      <Select onValueChange={onChange}>
        <SelectTrigger aria-label="Board" size="sm">
          <SelectValue placeholder="Pick a board" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Teams</SelectLabel>
            <SelectItem value="eng">Engineering</SelectItem>
            <SelectItem value="cs">Customer success</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Finance</SelectLabel>
            <SelectItem value="pay">Payroll</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  it('opens, picks an option and closes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderUi(<Example onChange={onChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Board' });
    expect(trigger).toHaveAttribute('data-size', 'sm');
    expect(trigger).toHaveTextContent('Pick a board');
    await user.click(trigger);
    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByText('Teams')).toHaveAttribute('data-slot', 'select-label');
    await user.click(within(listbox).getByRole('option', { name: 'Payroll' }));
    expect(onChange).toHaveBeenCalledWith('pay');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Payroll');
  });

  it('opens and picks with the keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderUi(<Example onChange={onChange} />);
    screen.getByRole('combobox', { name: 'Board' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });
});

describe('Command', () => {
  function List() {
    return (
      <>
        <CommandInput placeholder="Search or jump to" />
        <CommandList>
          <CommandEmpty>No match.</CommandEmpty>
          <CommandGroup heading="Go to">
            <CommandItem>
              Home <CommandShortcut>G H</CommandShortcut>
            </CommandItem>
            <CommandItem>Boards</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="People">
            <CommandItem>Ava Thompson</CommandItem>
          </CommandGroup>
        </CommandList>
      </>
    );
  }

  it('filters its items as you type and shows the empty state', async () => {
    const user = userEvent.setup();
    renderUi(
      <Command>
        <List />
      </Command>,
    );
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await user.type(screen.getByPlaceholderText('Search or jump to'), 'ava');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Ava Thompson' })).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText('Search or jump to'));
    await user.type(screen.getByPlaceholderText('Search or jump to'), 'zzz');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByText('No match.')).toHaveAttribute('data-slot', 'command-empty');
  });

  it('selects an item with the keyboard', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderUi(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem onSelect={onSelect}>Boards</CommandItem>
        </CommandList>
      </Command>,
    );
    await user.type(screen.getByPlaceholderText('Search'), '{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('opens as a dialog with the default footer and closes on Escape', async () => {
    const user = userEvent.setup();
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Search</Button>
          <CommandDialog open={open} onOpenChange={setOpen}>
            <List />
          </CommandDialog>
        </>
      );
    }
    renderUi(<Example />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Search' }));
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    expect(dialog.className).toContain('max-w-[640px]');
    expect(dialog.className).toContain('top-[12dvh]');
    expect(dialog.querySelector('[data-slot="command-footer"]')).toHaveTextContent('MoveEnterOpen');
    await user.type(within(dialog).getByPlaceholderText('Search or jump to'), 'boards');
    expect(within(dialog).getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('takes a custom footer', async () => {
    renderUi(
      <CommandDialog open footer={<div>Custom hint</div>}>
        <List />
      </CommandDialog>,
    );
    await screen.findByRole('dialog');
    expect(screen.getByText('Custom hint')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="command-footer"]')).not.toBeInTheDocument();
  });
});

describe('Tooltip', () => {
  it('opens when its trigger takes focus and closes on blur', async () => {
    const user = userEvent.setup();
    renderUi(
      <Tooltip>
        <TooltipTrigger>Info</TooltipTrigger>
        <TooltipContent>Shown on focus</TooltipContent>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Shown on focus');
    await user.tab();
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('opens on hover after its delay', async () => {
    const user = userEvent.setup();
    renderUi(
      <Tooltip>
        <TooltipTrigger>Info</TooltipTrigger>
        <TooltipContent>Shown on hover</TooltipContent>
      </Tooltip>,
    );
    await user.hover(screen.getByRole('button', { name: 'Info' }));
    expect(await screen.findByRole('tooltip', undefined, { timeout: 2000 })).toHaveTextContent('Shown on hover');
  });

  it('positions and opens from an asChild button (React 18 safe ref)', async () => {
    const user = userEvent.setup();
    renderUi(
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">Save</button>
        </TooltipTrigger>
        <TooltipContent>Save the draft</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Save' });
    expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger');
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Save the draft');
    // Popper only leaves its parked transform once the trigger's ref gave it an anchor to measure.
    const wrapper = document.querySelector('[data-radix-popper-content-wrapper]') as HTMLElement;
    await waitFor(() => expect(wrapper.style.transform).not.toBe('translate(0, -200%)'));
  });

  it('does the same for a Sole Button as the asChild child', async () => {
    const user = userEvent.setup();
    renderUi(
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Share</Button>
        </TooltipTrigger>
        <TooltipContent>Copy the link</TooltipContent>
      </Tooltip>,
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy the link');
    const wrapper = document.querySelector('[data-radix-popper-content-wrapper]') as HTMLElement;
    await waitFor(() => expect(wrapper.style.transform).not.toBe('translate(0, -200%)'));
  });
});

// Every wrapper that renders an element or a Radix content part forwards its ref to that element.
type Render = (ref: (el: HTMLElement | null) => void) => ReactNode;

const dialogCases: [string, Render][] = [
  ['DialogTrigger', (ref) => <Dialog><DialogTrigger ref={ref}>t</DialogTrigger></Dialog>],
  ['DialogContent', (ref) => <Dialog open><DialogContent ref={ref}><DialogTitle>t</DialogTitle><DialogDescription>d</DialogDescription></DialogContent></Dialog>],
  ['DialogOverlay', (ref) => <Dialog open><DialogPortal><DialogOverlay ref={ref} /></DialogPortal></Dialog>],
  ['DialogClose', (ref) => <Dialog open><DialogContent><DialogTitle>t</DialogTitle><DialogDescription>d</DialogDescription><DialogClose ref={ref}>c</DialogClose></DialogContent></Dialog>],
  ['DialogTitle', (ref) => <Dialog open><DialogContent><DialogTitle ref={ref}>t</DialogTitle><DialogDescription>d</DialogDescription></DialogContent></Dialog>],
  ['DialogDescription', (ref) => <Dialog open><DialogContent><DialogTitle>t</DialogTitle><DialogDescription ref={ref}>d</DialogDescription></DialogContent></Dialog>],
  ['DialogHeader', (ref) => <DialogHeader ref={ref} />],
  ['DialogFooter', (ref) => <DialogFooter ref={ref} />],
];

const alertDialogCases: [string, Render][] = [
  ['AlertDialogTrigger', (ref) => <AlertDialog><AlertDialogTrigger ref={ref}>t</AlertDialogTrigger></AlertDialog>],
  ['AlertDialogContent', (ref) => <AlertDialog open><AlertDialogContent ref={ref}><AlertDialogTitle>t</AlertDialogTitle><AlertDialogDescription>d</AlertDialogDescription></AlertDialogContent></AlertDialog>],
  ['AlertDialogOverlay', (ref) => <AlertDialog open><AlertDialogPortal><AlertDialogOverlay ref={ref} /></AlertDialogPortal></AlertDialog>],
  ['AlertDialogTitle', (ref) => <AlertDialog open><AlertDialogContent><AlertDialogTitle ref={ref}>t</AlertDialogTitle><AlertDialogDescription>d</AlertDialogDescription></AlertDialogContent></AlertDialog>],
  ['AlertDialogDescription', (ref) => <AlertDialog open><AlertDialogContent><AlertDialogTitle>t</AlertDialogTitle><AlertDialogDescription ref={ref}>d</AlertDialogDescription></AlertDialogContent></AlertDialog>],
  ['AlertDialogAction', (ref) => <AlertDialog open><AlertDialogContent><AlertDialogTitle>t</AlertDialogTitle><AlertDialogDescription>d</AlertDialogDescription><AlertDialogAction ref={ref}>a</AlertDialogAction></AlertDialogContent></AlertDialog>],
  ['AlertDialogCancel', (ref) => <AlertDialog open><AlertDialogContent><AlertDialogTitle>t</AlertDialogTitle><AlertDialogDescription>d</AlertDialogDescription><AlertDialogCancel ref={ref}>c</AlertDialogCancel></AlertDialogContent></AlertDialog>],
  ['AlertDialogHeader', (ref) => <AlertDialogHeader ref={ref} />],
  ['AlertDialogFooter', (ref) => <AlertDialogFooter ref={ref} />],
  ['AlertDialogMedia', (ref) => <AlertDialogMedia ref={ref} />],
];

const sheetCases: [string, Render][] = [
  ['SheetTrigger', (ref) => <Sheet><SheetTrigger ref={ref}>t</SheetTrigger></Sheet>],
  ['SheetContent', (ref) => <Sheet open><SheetContent ref={ref}><SheetTitle>t</SheetTitle><SheetDescription>d</SheetDescription></SheetContent></Sheet>],
  ['SheetClose', (ref) => <Sheet open><SheetContent><SheetTitle>t</SheetTitle><SheetDescription>d</SheetDescription><SheetClose ref={ref}>c</SheetClose></SheetContent></Sheet>],
  ['SheetTitle', (ref) => <Sheet open><SheetContent><SheetTitle ref={ref}>t</SheetTitle><SheetDescription>d</SheetDescription></SheetContent></Sheet>],
  ['SheetDescription', (ref) => <Sheet open><SheetContent><SheetTitle>t</SheetTitle><SheetDescription ref={ref}>d</SheetDescription></SheetContent></Sheet>],
  ['SheetHeader', (ref) => <SheetHeader ref={ref} />],
  ['SheetFooter', (ref) => <SheetFooter ref={ref} />],
];

const popoverCases: [string, Render][] = [
  ['PopoverTrigger', (ref) => <Popover><PopoverTrigger ref={ref}>t</PopoverTrigger></Popover>],
  ['PopoverContent', (ref) => <Popover open><PopoverAnchor /><PopoverContent ref={ref}>c</PopoverContent></Popover>],
  ['PopoverAnchor', (ref) => <Popover><PopoverAnchor ref={ref} /></Popover>],
  ['PopoverHeader', (ref) => <PopoverHeader ref={ref} />],
  ['PopoverTitle', (ref) => <PopoverTitle ref={ref} />],
  ['PopoverDescription', (ref) => <PopoverDescription ref={ref} />],
];

const menuCases: [string, Render][] = [
  ['DropdownMenuTrigger', (ref) => <DropdownMenu><DropdownMenuTrigger ref={ref}>t</DropdownMenuTrigger></DropdownMenu>],
  ['DropdownMenuContent', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent ref={ref} /></DropdownMenu>],
  ['DropdownMenuGroup', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuGroup ref={ref} /></DropdownMenuContent></DropdownMenu>],
  ['DropdownMenuLabel', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel ref={ref}>l</DropdownMenuLabel></DropdownMenuContent></DropdownMenu>],
  ['DropdownMenuItem', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem ref={ref}>i</DropdownMenuItem></DropdownMenuContent></DropdownMenu>],
  ['DropdownMenuCheckboxItem', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuCheckboxItem ref={ref} checked>i</DropdownMenuCheckboxItem></DropdownMenuContent></DropdownMenu>],
  ['DropdownMenuRadioGroup', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuRadioGroup ref={ref} /></DropdownMenuContent></DropdownMenu>],
  ['DropdownMenuRadioItem', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuRadioGroup value="a"><DropdownMenuRadioItem ref={ref} value="a">a</DropdownMenuRadioItem></DropdownMenuRadioGroup></DropdownMenuContent></DropdownMenu>],
  ['DropdownMenuSeparator', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuSeparator ref={ref} /></DropdownMenuContent></DropdownMenu>],
  ['DropdownMenuShortcut', (ref) => <DropdownMenuShortcut ref={ref} />],
  ['DropdownMenuSubTrigger', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuSub><DropdownMenuSubTrigger ref={ref}>s</DropdownMenuSubTrigger></DropdownMenuSub></DropdownMenuContent></DropdownMenu>],
  ['DropdownMenuSubContent', (ref) => <DropdownMenu open><DropdownMenuTrigger>t</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuSub open><DropdownMenuSubTrigger>s</DropdownMenuSubTrigger><DropdownMenuSubContent ref={ref} /></DropdownMenuSub></DropdownMenuContent></DropdownMenu>],
];

const selectCases: [string, Render][] = [
  ['SelectTrigger', (ref) => <Select><SelectTrigger ref={ref}><SelectValue /></SelectTrigger></Select>],
  ['SelectValue', (ref) => <Select><SelectTrigger><SelectValue ref={ref} placeholder="p" /></SelectTrigger></Select>],
  ['SelectContent', (ref) => <Select open><SelectTrigger><SelectValue /></SelectTrigger><SelectContent ref={ref}><SelectItem value="a">a</SelectItem></SelectContent></Select>],
  ['SelectGroup', (ref) => <Select open><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup ref={ref}><SelectItem value="a">a</SelectItem></SelectGroup></SelectContent></Select>],
  ['SelectLabel', (ref) => <Select open><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectLabel ref={ref}>l</SelectLabel><SelectItem value="a">a</SelectItem></SelectGroup></SelectContent></Select>],
  ['SelectItem', (ref) => <Select open><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem ref={ref} value="a">a</SelectItem></SelectContent></Select>],
  ['SelectSeparator', (ref) => <Select open><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a">a</SelectItem><SelectSeparator ref={ref} /></SelectContent></Select>],
];

const commandCases: [string, Render][] = [
  ['Command', (ref) => <Command ref={ref} />],
  ['CommandInput', (ref) => <Command><CommandInput ref={ref} /></Command>],
  ['CommandList', (ref) => <Command><CommandList ref={ref} /></Command>],
  ['CommandEmpty', (ref) => <Command><CommandInput defaultValue="zzz" /><CommandList><CommandEmpty ref={ref}>none</CommandEmpty></CommandList></Command>],
  ['CommandGroup', (ref) => <Command><CommandList><CommandGroup ref={ref} heading="g"><CommandItem>i</CommandItem></CommandGroup></CommandList></Command>],
  ['CommandItem', (ref) => <Command><CommandList><CommandItem ref={ref}>i</CommandItem></CommandList></Command>],
  ['CommandSeparator', (ref) => <Command><CommandList><CommandSeparator ref={ref} alwaysRender /></CommandList></Command>],
  ['CommandShortcut', (ref) => <CommandShortcut ref={ref} />],
];

const tooltipCases: [string, Render][] = [
  ['TooltipTrigger', (ref) => <Tooltip><TooltipTrigger ref={ref}>t</TooltipTrigger></Tooltip>],
  ['TooltipContent', (ref) => <Tooltip open><TooltipTrigger>t</TooltipTrigger><TooltipContent ref={ref}>c</TooltipContent></Tooltip>],
];

describe('refs', () => {
  const cases = [
    ...dialogCases,
    ...alertDialogCases,
    ...sheetCases,
    ...popoverCases,
    ...menuCases,
    ...selectCases,
    ...commandCases,
    ...tooltipCases,
  ];

  it.each(cases)('%s forwards its ref', async (_name, render) => {
    let got: HTMLElement | null = null;
    renderUi(render((el) => {
      if (el) got = el;
    }));
    await waitFor(() => expect(got).toBeInstanceOf(HTMLElement));
  });

  const modules = {
    dialog: dialogModule,
    alertDialog: alertDialogModule,
    command: commandModule,
    dropdownMenu: dropdownModule,
    popover: popoverModule,
    select: selectModule,
    sheet: sheetModule,
    tooltip: tooltipModule,
  };
  const forwardRefs = Object.entries(modules).flatMap(([file, mod]) =>
    Object.entries(mod)
      .filter(([, part]) => typeof part === 'object' && part !== null && '$$typeof' in part)
      .map(([name, part]): [string, string, unknown] => [file, name, part]),
  );

  it('found the forwardRef parts', () => {
    expect(forwardRefs.length).toBeGreaterThan(60);
  });

  it.each(forwardRefs)('%s: %s has a displayName that matches its export', (_file, name, part) => {
    expect((part as { displayName?: string }).displayName).toBe(name);
  });
});
