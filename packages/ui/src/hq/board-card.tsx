'use client';

import * as React from 'react';
import { AvatarStack } from '../components/sole/avatar.tsx';
import { LabelTags } from '../components/sole/label-tag.tsx';
import { cn } from '../lib/cn.ts';
import type { DateOnly } from '../lib/dates.ts';
import { SoleLink } from '../lib/sole-provider.tsx';
import { DueChip } from './due-chip.tsx';
import { PriorityIcon } from './priority-icon.tsx';
import type { WorkItemSummary } from './types.ts';

// A kanban card (brand-and-ux 5.14, 50.3): key and priority, the title up to 3 lines, then
// labels, due and avatars; 9px in at the top and bottom, 7px and 8px between the rows. Spread drag props onto it; the title is the link, so a
// click opens and a drag moves.

export interface BoardCardProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  item: WorkItemSummary;
  /** Defaults to today on the provider's clock. */
  today?: DateOnly;
  /** Open somewhere other than the full page, e.g. the side sheet. Cmd-click still opens the page. */
  onOpen?: (item: WorkItemSummary) => void;
  dragging?: boolean;
}

export const BoardCard = React.forwardRef<HTMLDivElement, BoardCardProps>(function BoardCard(
  { item, today, onOpen, dragging = false, className, ...rest },
  ref,
) {
  const onClick = onOpen
    ? (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(item);
      }
    : undefined;
  return (
    <div
      ref={ref}
      data-board-card={item.key}
      className={cn(
        'flex min-h-16 flex-col rounded-lg border border-border bg-card px-3 py-[9px] text-card-foreground shadow-sm transition-shadow duration-[120ms]',
        dragging && 'shadow-lg ring-1 ring-brand',
        className,
      )}
      {...rest}
    >
      <div className="flex h-4 items-center gap-2">
        <span className="tnum text-label text-subtle-foreground">{item.key}</span>
        <PriorityIcon priority={item.priority} className="ml-auto" />
      </div>
      <SoleLink
        href={item.href}
        onClick={onClick}
        className={cn(
          'mt-[7px] line-clamp-3 text-body font-medium outline-none hover:underline focus-visible:underline',
          item.state?.group === 'completed' && 'text-muted-foreground',
          item.state?.group === 'cancelled' && 'text-subtle-foreground line-through',
        )}
      >
        {item.title}
      </SoleLink>
      {(item.labels.length > 0 || item.dueDate || item.assignees.length > 0) && (
        <div className="mt-2 flex min-w-0 items-center gap-1.5">
          <LabelTags labels={item.labels} />
          <DueChip due={item.dueDate} today={today} done={item.isDone} />
          <AvatarStack people={item.assignees} className="ml-auto" />
        </div>
      )}
    </div>
  );
});
BoardCard.displayName = 'BoardCard';
