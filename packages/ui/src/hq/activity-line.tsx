'use client';

import { ArrowLeftRight, CalendarClock, CirclePlus, Link2, MessageSquare, Pencil, SlidersHorizontal, Tag, Trash2, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn.ts';
import { formatFullTimestamp, formatRelative } from '../lib/dates.ts';
import type { Timestamp } from '../lib/dates.ts';
import type { SolePerson } from '../lib/person.ts';
import { useNow, useSole } from '../lib/sole-provider.tsx';

// One activity row in a work item's timeline: an icon for the kind of change, the
// sentence, and when (relative under a week, then the date). The sentence is built by
// the app (Sole HQ's describeActivity), so the words stay with the data they describe.

/** The kind of change, which picks the icon. */
export type ActivityKind = 'created' | 'state' | 'assignee' | 'label' | 'due' | 'comment' | 'link' | 'delete' | 'edit' | 'property';

const ICONS: Record<ActivityKind, LucideIcon> = {
  created: CirclePlus,
  state: ArrowLeftRight,
  assignee: UserPlus,
  label: Tag,
  due: CalendarClock,
  comment: MessageSquare,
  link: Link2,
  delete: Trash2,
  edit: Pencil,
  property: SlidersHorizontal,
};

export interface ActivityLineProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /**
   * Who made the change. The sentence already names them, so nothing is drawn for it; the id is kept on the
   * line as `data-actor` for tests and hooks. `null` is a former member.
   */
  actor?: SolePerson | null;
  /** Picks the icon. Defaults to a plain edit. */
  kind?: ActivityKind;
  /** When it happened. */
  at: Timestamp;
  /** Overrides the provider's clock. */
  now?: Date;
  /** The sentence, "Ava moved this from Todo to Done". */
  children: React.ReactNode;
}

export const ActivityLine = React.forwardRef<HTMLDivElement, ActivityLineProps>(function ActivityLine(
  { actor, kind = 'edit', at, now, children, className, ...props },
  ref,
) {
  const tick = useNow();
  const { timeZone } = useSole();
  const Icon = ICONS[kind];
  return (
    <div
      ref={ref}
      data-actor={actor?.id}
      className={cn('flex min-h-8 items-center gap-2.5 text-label font-normal text-muted-foreground', className)}
      {...props}
    >
      <Icon size={14} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-subtle-foreground" />
      <span className="min-w-0 flex-1">{children}</span>
      <time dateTime={at} title={formatFullTimestamp(at, timeZone)} className="tnum shrink-0 text-subtle-foreground">
        {formatRelative(at, now ?? tick, timeZone)}
      </time>
    </div>
  );
});
ActivityLine.displayName = 'ActivityLine';
