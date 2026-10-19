'use client';

import { CalendarCheck } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn.ts';
import { daysBetween, formatDate, formatLongDate } from '../lib/dates.ts';
import type { DateOnly } from '../lib/dates.ts';
import { useToday } from '../lib/sole-provider.tsx';
import type { ReviewState } from './types.ts';

// Review pill for wiki rows (brand-and-ux 5.11). A current page shows nothing: the
// pill only appears when there is something to do.

/** A review date this many days away, or fewer, is "due soon". */
export const REVIEW_SOON_DAYS = 14;

/**
 * current: more than 14 days away. due: today up to 14 days away. overdue: the date
 * has passed. unknown: never reviewed, or no next date. The same rule runs in SQL as
 * hq.page_review_state() in Sole HQ; keep the two in step.
 */
export function reviewState(reviewDue: DateOnly | null, today: DateOnly): ReviewState {
  if (!reviewDue) return 'unknown';
  if (reviewDue < today) return 'overdue';
  if (daysBetween(today, reviewDue) <= REVIEW_SOON_DAYS) return 'due';
  return 'current';
}

export interface ReviewBadgeModel {
  tone: 'warning' | 'danger' | 'neutral';
  label: string;
  /** Tooltip, with the full date where there is one. */
  title: string;
}

/**
 * The short pill for list rows. Current pages get no pill at all: a badge on a third
 * of the rows stops being read (U52).
 */
export function reviewBadge(reviewDue: DateOnly | null, today: DateOnly): ReviewBadgeModel | null {
  const state = reviewState(reviewDue, today);
  switch (state) {
    case 'current':
      return null;
    case 'due':
      return {
        tone: 'warning',
        label: `Review by ${formatDate(reviewDue!, today)}`,
        title: `Review by ${formatLongDate(reviewDue!)}`,
      };
    case 'overdue':
      return { tone: 'danger', label: 'Review due', title: `Review was due ${formatLongDate(reviewDue!)}` };
    case 'unknown':
      return { tone: 'neutral', label: 'Never reviewed', title: 'Nobody has confirmed this page.' };
  }
}

// One icon for review, CalendarCheck (brand-and-ux 5.7); the tone says which state.
const TONES = {
  warning: 'border-warning-border bg-warning-soft text-warning-text',
  danger: 'border-danger-border bg-danger-soft text-danger-text',
  neutral: 'border-border bg-transparent text-muted-foreground',
} as const;

export interface ReviewBadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  /** The page's next review date, or null if it was never reviewed. */
  reviewDue: DateOnly | null;
  /** Defaults to today on the provider's clock. */
  today?: DateOnly;
}

export const ReviewBadge = React.forwardRef<HTMLSpanElement, ReviewBadgeProps>(function ReviewBadge({ reviewDue, today, className, ...props }, ref) {
  const current = useToday();
  const badge = reviewBadge(reviewDue, today ?? current);
  if (!badge) return null;
  const box = TONES[badge.tone];
  return (
    <span
      {...props}
      ref={ref}
      data-review={badge.tone}
      title={badge.title}
      className={cn('inline-flex h-[22px] shrink-0 items-center gap-[5px] rounded-md border px-2 text-label whitespace-nowrap', box, className)}
    >
      <CalendarCheck size={12} strokeWidth={1.8} aria-hidden="true" />
      {badge.label}
    </span>
  );
});
ReviewBadge.displayName = 'ReviewBadge';

const STATE_BADGE: Record<Exclude<ReviewState, 'current'>, { tone: keyof typeof TONES; label: string; title: string }> = {
  overdue: { tone: 'danger', label: 'Review due', title: 'Past its review date' },
  due: { tone: 'warning', label: 'Review soon', title: 'Due for review within 14 days' },
  unknown: { tone: 'neutral', label: 'Never reviewed', title: 'Nobody has confirmed this page.' },
};

export interface ReviewStateBadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  state: ReviewState | null | undefined;
}

/**
 * The same pill from a review state alone, where the date is not known (Ask Sole's
 * sources carry hq.page_review_state, not the date). Quiet for a current page.
 */
export const ReviewStateBadge = React.forwardRef<HTMLSpanElement, ReviewStateBadgeProps>(function ReviewStateBadge(
  { state, className, ...props },
  ref,
) {
  if (!state || state === 'current') return null;
  const badge = STATE_BADGE[state];
  return (
    <span
      {...props}
      ref={ref}
      data-review={badge.tone}
      title={badge.title}
      className={cn('inline-flex h-[22px] shrink-0 items-center gap-[5px] rounded-md border px-2 text-label whitespace-nowrap', TONES[badge.tone], className)}
    >
      <CalendarCheck size={12} strokeWidth={1.8} aria-hidden="true" />
      {badge.label}
    </span>
  );
});
ReviewStateBadge.displayName = 'ReviewStateBadge';
