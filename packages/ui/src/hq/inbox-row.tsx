'use client';

import * as React from 'react';
import { Avatar } from '../components/sole/avatar.tsx';
import { cn } from '../lib/cn.ts';
import { formatFullTimestamp, formatRelative } from '../lib/dates.ts';
import type { Timestamp } from '../lib/dates.ts';
import type { SolePerson } from '../lib/person.ts';
import { SoleLink, useNow, useSole } from '../lib/sole-provider.tsx';
import type { SoleLinkProps } from '../lib/sole-provider.tsx';

// An Inbox row (brand-and-ux 5.14): unread dot, who, the sentence, the item, when.
// The row is one link. The app marks it read in `onClick` and the link opens the item.

export interface InboxRowProps extends Omit<SoleLinkProps, 'children' | 'title'> {
  /** Who did it. `null` draws the plain "?" avatar of a former member. */
  actor: SolePerson | null | undefined;
  /** The sentence: "Ava Thompson assigned this to you". */
  summary: React.ReactNode;
  /** Second line: the item or page title. Comment rows can quote the comment. */
  detail: React.ReactNode;
  /** When it happened. Shown as relative time, with the full stamp on hover. */
  at: Timestamp;
  /** Draws the blue dot and tells screen readers. */
  unread?: boolean;
  selected?: boolean;
  /** Kept on the row as `data-inbox-row`, for keyboard movement and tests. */
  notificationId?: string;
  /** Overrides the provider's clock. */
  now?: Date;
}

export const InboxRow = React.forwardRef<HTMLAnchorElement, InboxRowProps>(function InboxRow(
  { actor, summary, detail, at, unread = false, selected = false, notificationId, now, className, ...props },
  ref,
) {
  const tick = useNow();
  const { timeZone } = useSole();
  return (
    <SoleLink
      ref={ref}
      data-inbox-row={notificationId ?? ''}
      data-unread={unread || undefined}
      className={cn(
        'flex min-h-[56px] items-center gap-2.5 border-b border-hairline py-2 pr-4 pl-3 outline-none transition-colors duration-[120ms] hover:bg-row-hover focus-visible:shadow-[inset_0_0_0_2px_var(--brand)]',
        selected && 'bg-accent hover:bg-accent',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', unread ? 'bg-brand' : 'bg-transparent')} />
      <span className="sr-only">{unread ? 'Unread. ' : ''}</span>
      <Avatar person={actor} size={24} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body text-muted-foreground">{summary}</span>
        <span className="truncate text-body font-medium text-foreground">{detail}</span>
      </span>
      <time dateTime={at} title={formatFullTimestamp(at, timeZone)} className="tnum shrink-0 text-label font-normal text-subtle-foreground">
        {formatRelative(at, now ?? tick, timeZone)}
      </time>
    </SoleLink>
  );
});
InboxRow.displayName = 'InboxRow';
