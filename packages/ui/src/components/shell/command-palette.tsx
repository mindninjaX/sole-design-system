'use client';

import * as React from 'react';
import { Kbd } from '../sole/kbd.tsx';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from '../ui/command.tsx';

// Cmd K (20.2-command-palette-cmd-k.png; behaviour-core 5, D27): 640px, anchored near the
// top, groups under small headings, a footer that names the keys. This is the frame: the
// groups arrive as props and typing filters them by label. A palette that searches a
// server passes `filter={false}` and `onQueryChange`, and sends back the rows it found.

export interface CommandPaletteItem {
  id: string;
  label: string;
  /** An icon element, drawn at 14px. */
  icon?: React.ReactNode;
  /** The key hint on the right, as words: "C" or "Cmd J". */
  shortcut?: string;
  /** Runs after the palette has closed. */
  onSelect: () => void;
}

export interface CommandPaletteGroup {
  heading: string;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
  groups: CommandPaletteGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  /** Shown when nothing matches what was typed. */
  empty?: string;
  /** The palette's name for screen readers, and the search field's label. */
  title?: string;
  description?: string;
  /** false when the caller filters the rows itself. */
  filter?: boolean;
  /** The typed words, when the caller controls them. */
  query?: string;
  onQueryChange?: (query: string) => void;
}

/** 20.2's group headings: 26px from a heading to its first row, 31px from a last row to the next heading. */
const GROUP_CLASS = '[&_[cmdk-group-heading]]:pt-[7px] [&_[cmdk-group-heading]]:pb-0.5';

const matches = (text: string, term: string) => text.toLowerCase().includes(term.toLowerCase());

export function CommandPalette({
  groups,
  open,
  onOpenChange,
  placeholder = 'Search or jump to',
  empty = 'Nothing matches that.',
  title = 'Command palette',
  description = 'Search, or jump to a screen',
  filter = true,
  query,
  onQueryChange,
}: CommandPaletteProps) {
  const [ownQuery, setOwnQuery] = React.useState('');
  const text = query ?? ownQuery;
  const setText = (value: string) => {
    if (query === undefined) setOwnQuery(value);
    onQueryChange?.(value);
  };
  const term = text.trim();
  const shown = groups
    .map((group) => ({ ...group, items: filter && term ? group.items.filter((item) => matches(item.label, term)) : group.items }))
    .filter((group) => group.items.length > 0);

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setOwnQuery('');
      }}
      title={title}
      description={description}
      shouldFilter={false}
    >
      <CommandInput value={text} onValueChange={setText} placeholder={placeholder} aria-label={title} trailing={<Kbd keys={['Esc']} />} />
      <CommandList>
        <CommandEmpty>{empty}</CommandEmpty>
        {shown.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading} className={GROUP_CLASS}>
            {group.items.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => {
                  onOpenChange(false);
                  setOwnQuery('');
                  item.onSelect();
                }}
              >
                {item.icon}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
