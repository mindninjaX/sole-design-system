'use client';

import * as React from 'react';
import { List, Search, SquareKanban, X } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { Kbd } from './kbd.tsx';

// Filters and switches (02-components.png 02.3; 50.1 to 50.3, 60.1, 90.7).

/**
 * Filter chip: 26px, an outline, a 14px icon and 12/500 text. Active is the accent fill
 * with a blue border and blue text, and an x that clears it (50.2 "Assignee: Ava").
 * It is the trigger for its picker, so it forwards its ref and props to the button.
 */
export const FilterChip = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> & { icon?: React.ReactNode; label: React.ReactNode; active?: boolean; onClear?: () => void; clearLabel?: string }
>(function FilterChip({ icon, label, active = false, onClear, clearLabel, className, ...props }, ref) {
  return (
    <span
      data-filter-chip={active ? 'active' : 'default'}
      className={cn(
        'inline-flex h-[26px] shrink-0 items-center rounded-md border text-label transition-colors duration-[120ms]',
        active ? 'border-brand bg-accent text-accent-foreground' : 'border-border bg-card text-secondary-foreground hover:bg-row-hover',
        className,
      )}
    >
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        className={cn(
          'inline-flex h-full min-w-0 items-center gap-1.5 rounded-md pl-2 outline-none focus-visible:shadow-[var(--focus-ring)] [&_svg]:size-3.5 [&_svg]:shrink-0',
          active && onClear ? 'pr-1' : 'pr-2.5',
          active ? '[&_svg]:text-accent-foreground' : '[&_svg]:text-muted-foreground',
        )}
        {...props}
      >
        {icon}
        <span className="truncate">{label}</span>
      </button>
      {active && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel ?? `Clear ${typeof label === 'string' ? label : 'this filter'}`}
          className="mr-[3px] inline-flex size-4 items-center justify-center rounded-sm text-accent-foreground outline-none hover:bg-brand/10 focus-visible:shadow-[var(--focus-ring)]"
        >
          <X className="size-3" strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </span>
  );
});
FilterChip.displayName = 'FilterChip';

/** Chip/Removable (90.7 allowed domains): 26px neutral chip with an x. */
export const RemovableChip = React.forwardRef<
  HTMLSpanElement,
  Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> & { children: React.ReactNode; onRemove: () => void; removeLabel: string }
>(function RemovableChip({ children, onRemove, removeLabel, className, ...props }, ref) {
  return (
    <span ref={ref} className={cn('inline-flex h-6 shrink-0 items-center gap-1 rounded-md bg-muted pr-[3px] pl-2.5 text-label text-foreground', className)} {...props}>
      <span className="truncate">{children}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="inline-flex size-[18px] items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-sidebar-hover hover:text-foreground focus-visible:shadow-[var(--focus-ring)]"
      >
        <X className="size-3" strokeWidth={2} aria-hidden="true" />
      </button>
    </span>
  );
});
RemovableChip.displayName = 'RemovableChip';

export type BoardView = 'list' | 'kanban';

/** View switch (50.1, 50.3): List and Kanban on a muted track; the current one is white. */
export const ViewSwitch = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<'div'>, 'children' | 'onChange' | 'role' | 'aria-label'> & { value: BoardView; onChange: (view: BoardView) => void }
>(function ViewSwitch({ value, onChange, className, ...props }, ref) {
  const items: Array<{ value: BoardView; label: string; Icon: typeof List }> = [
    { value: 'list', label: 'List', Icon: List },
    { value: 'kanban', label: 'Kanban', Icon: SquareKanban },
  ];
  return (
    <div ref={ref} {...props} role="radiogroup" aria-label="View" className={cn('inline-flex h-[30px] shrink-0 items-center rounded-lg bg-muted p-0.5', className)}>
      {items.map(({ value: v, label, Icon }) => {
        const on = v === value;
        return (
          <button
            key={v}
            type="button"
            data-view={v}
            role="radio"
            aria-checked={on}
            onClick={() => !on && onChange(v)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const next = value === 'list' ? 'kanban' : 'list';
                e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-view="${next}"]`)?.focus();
                onChange(next);
              }
            }}
            tabIndex={on ? 0 : -1}
            className={cn(
              'inline-flex h-[26px] items-center gap-1.5 rounded-md px-2.5 text-label outline-none transition-colors duration-[120ms] focus-visible:shadow-[var(--focus-ring)] [&_svg]:size-3.5',
              on ? 'bg-card text-foreground shadow-sm [&_svg]:text-foreground' : 'text-muted-foreground hover:text-foreground [&_svg]:text-muted-foreground',
            )}
          >
            <Icon aria-hidden="true" strokeWidth={1.8} />
            {label}
          </button>
        );
      })}
    </div>
  );
});
ViewSwitch.displayName = 'ViewSwitch';

/**
 * Field/Search (60.1 "Search pages", 80.1): a 32px field with a search icon and the "/"
 * hint. The "/" key is the screen's to wire (focus()), through the forwarded ref.
 */
export const SearchField = React.forwardRef<HTMLInputElement, Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> & { shortcut?: string | null; wrapperClassName?: string }>(
  function SearchField({ shortcut = '/', wrapperClassName, className, ...props }, ref) {
    return (
      <label
        className={cn(
          'flex h-8 min-w-0 cursor-text items-center gap-2 rounded-lg border border-input bg-field pr-2 pl-2.5 transition-[color,box-shadow] duration-[120ms] focus-within:border-ring focus-within:shadow-[var(--focus-ring)]',
          wrapperClassName,
        )}
      >
        <Search aria-hidden="true" strokeWidth={1.8} className="size-3.5 shrink-0 text-subtle-foreground" />
        <input
          ref={ref}
          type="search"
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-subtle-foreground [&::-webkit-search-cancel-button]:hidden',
            className,
          )}
          {...props}
        />
        {shortcut && <Kbd keys={[shortcut]} className="bg-muted" />}
      </label>
    );
  },
);
SearchField.displayName = 'SearchField';
