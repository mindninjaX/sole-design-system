'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';
import { personName } from '../../lib/person.ts';
import type { SolePerson } from '../../lib/person.ts';
import { Avatar } from './avatar.tsx';
import { Pill } from './pill.tsx';

// Tables (02-components.png 02.9; 80.1 People, 90.1 Access): a 12px card, the
// TableHeader (layout.tsx), then rows with a hairline between them. Give the header and
// every row the same grid template, e.g. `grid-cols-[1fr_240px_96px]`, so the columns line up.

/** The card around a table. `label` names it for screen readers ("People"). */
export const Table = React.forwardRef<HTMLDivElement, Omit<React.ComponentPropsWithoutRef<'div'>, 'role' | 'aria-label'> & { label: string }>(function Table(
  { label, className, ...props },
  ref,
) {
  return <div ref={ref} {...props} role="table" aria-label={label} className={cn('overflow-hidden rounded-xl border border-border bg-card', className)} />;
});
Table.displayName = 'Table';

/** A row: 52px (People row), or pass `min-h-14` for the 56px Access row. */
export const TableRow = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function TableRow({ className, ...props }, ref) {
  return <div ref={ref} role="row" className={cn('grid min-h-[52px] items-center gap-4 border-t border-hairline px-4 py-1', className)} {...props} />;
});
TableRow.displayName = 'TableRow';

export const TableCell = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function TableCell({ className, ...props }, ref) {
  return <div ref={ref} role="cell" className={cn('min-w-0 truncate text-body text-foreground', className)} {...props} />;
});
TableCell.displayName = 'TableCell';

/**
 * The person in a row (People row, Access row): the 32px avatar, the name at 13/500 with
 * an Admin pill, and a 12px line under it (their title, or their email).
 */
export const PersonCell = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
    person: SolePerson;
    admin?: boolean;
    /** "Founder", "ava@example.com". */
    detail?: React.ReactNode;
    /** A switched-off person: the name in the subtle grey. */
    muted?: boolean;
    /** Replaces the plain name, e.g. with a link to their page. */
    name?: React.ReactNode;
  }
>(function PersonCell({ person, admin = false, detail, muted = false, name, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('flex min-w-0 items-center gap-2.5', className)} {...props}>
      <Avatar person={person} size={32} />
      <div className="min-w-0">
        {/* 18px even with the pill in it, so a row with an admin is no taller. */}
        <div className="flex h-[18px] min-w-0 items-center gap-[7px]">
          <span className={cn('truncate text-body leading-[18px] font-medium', muted ? 'text-subtle-foreground' : 'text-foreground')}>{name ?? personName(person)}</span>
          {admin && <Pill tone="neutral">Admin</Pill>}
        </div>
        {detail && <p className="truncate text-label font-normal text-subtle-foreground">{detail}</p>}
      </div>
    </div>
  );
});
PersonCell.displayName = 'PersonCell';
