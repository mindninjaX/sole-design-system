'use client';

import { CalendarClock } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn.ts';
import { dueChip } from '../lib/dates.ts';
import type { DateOnly } from '../lib/dates.ts';
import { useToday } from '../lib/sole-provider.tsx';

// The due-date chip (brand-and-ux 5.10). Solid red is reserved for an open item past
// its due date and nothing else. Later dates and done items are plain text.

const TONES = {
  overdue: 'h-[22px] rounded-md border border-transparent bg-overdue px-2 text-overdue-foreground',
  today: 'h-[22px] rounded-md border border-danger-border bg-danger-soft px-2 text-danger-text',
  soon: 'h-[22px] rounded-md border border-transparent bg-neutral-soft px-2 text-neutral-text',
  plain: 'text-subtle-foreground',
  done: 'text-subtle-foreground',
} as const;

export interface DueChipProps extends React.ComponentPropsWithoutRef<'span'> {
  /** Nothing is drawn without a date. */
  due: DateOnly | null;
  /** Defaults to today on the provider's clock. */
  today?: DateOnly;
  /** Completed or cancelled. */
  done?: boolean;
}

export const DueChip = React.forwardRef<HTMLSpanElement, DueChipProps>(function DueChip({ due, today, done = false, className, ...props }, ref) {
  const current = useToday();
  if (!due) return null;
  const chip = dueChip(due, today ?? current, done);
  const boxed = chip.tone === 'overdue' || chip.tone === 'today' || chip.tone === 'soon';
  return (
    <span
      {...props}
      ref={ref}
      data-due={chip.tone}
      title={chip.title}
      aria-label={chip.ariaLabel}
      className={cn('tnum inline-flex shrink-0 items-center gap-[5px] text-label whitespace-nowrap', TONES[chip.tone], className)}
    >
      {boxed && <CalendarClock size={12} strokeWidth={1.8} aria-hidden="true" />}
      {chip.label}
    </span>
  );
});
DueChip.displayName = 'DueChip';
