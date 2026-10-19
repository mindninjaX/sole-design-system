'use client';

import * as React from 'react';
import { AvatarStack } from '../components/sole/avatar.tsx';
import { LabelTags } from '../components/sole/label-tag.tsx';
import { cn } from '../lib/cn.ts';
import type { DateOnly } from '../lib/dates.ts';
import { SoleLink } from '../lib/sole-provider.tsx';
import type { SoleLinkProps } from '../lib/sole-provider.tsx';
import { DueChip } from './due-chip.tsx';
import { PriorityIcon } from './priority-icon.tsx';
import { StateIcon } from './state-icon.tsx';
import type { WorkItemSummary } from './types.ts';

// The work item row (brand-and-ux 5.14): 36px, and the whole row is the link.
// [priority] [key] [state] [title] [labels, up to 2] [due] [assignees, up to 2].
// The key, due and assignee slots have fixed widths, so chips line up down a list
// (30.1-home.png, 50.1-board-list.png). Without assignees the slot stays, empty.

export interface WorkItemRowProps extends Omit<SoleLinkProps, 'href' | 'children' | 'onClick'> {
  item: WorkItemSummary;
  /** Defaults to today on the provider's clock. */
  today?: DateOnly;
  selected?: boolean;
  showAssignees?: boolean;
  /** Keep the assignee slot's width when it is empty. False drops it, as Home's My work does (30.1). */
  assigneeSlot?: boolean;
  /** Open somewhere other than the full page, e.g. the side sheet. Cmd-click still opens the page. */
  onOpen?: (item: WorkItemSummary) => void;
}

export const WorkItemRow = React.forwardRef<HTMLAnchorElement, WorkItemRowProps>(function WorkItemRow(
  { item, today, selected = false, showAssignees = true, assigneeSlot = true, onOpen, className, ...props },
  ref,
) {
  const group = item.state?.group ?? 'unstarted';
  const onClick = onOpen
    ? (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(item);
      }
    : undefined;

  return (
    <SoleLink
      {...props}
      ref={ref}
      href={item.href}
      onClick={onClick}
      data-work-item-row={item.key}
      aria-current={selected || undefined}
      className={cn(
        'group/row flex min-w-0 items-center gap-2.5 border-b border-hairline px-3 text-body transition-colors duration-[120ms] outline-none',
        'h-9 hover:bg-row-hover focus-visible:shadow-[inset_0_0_0_2px_var(--brand)]',
        selected && 'bg-accent hover:bg-accent',
        className,
      )}
    >
      <PriorityIcon priority={item.priority} />
      <span className="tnum w-[52px] shrink-0 truncate text-label text-subtle-foreground">{item.key}</span>
      <StateIcon group={group} name={item.state?.name} />
      <span
        className={cn(
          'min-w-0 flex-1 truncate font-medium text-foreground',
          group === 'completed' && 'text-muted-foreground',
          group === 'cancelled' && 'text-subtle-foreground line-through',
        )}
      >
        {item.title}
      </span>
      <LabelTags labels={item.labels} />
      <span className="flex min-w-[78px] shrink-0 justify-end">
        <DueChip due={item.dueDate} today={today} done={item.isDone} />
      </span>
      {assigneeSlot && <span className="flex w-11 shrink-0 justify-end">{showAssignees && <AvatarStack people={item.assignees} />}</span>}
    </SoleLink>
  );
});
WorkItemRow.displayName = 'WorkItemRow';
