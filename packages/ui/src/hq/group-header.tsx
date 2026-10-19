'use client';

import { ChevronDown, Plus } from 'lucide-react';
import * as React from 'react';
import { Button } from '../components/ui/button.tsx';
import { cn } from '../lib/cn.ts';
import { StateIcon } from './state-icon.tsx';
import type { StateGroup } from './types.ts';

// A list group header (brand-and-ux 5.14): 32px, state icon, name, count, and a "+"
// that appears on hover. `micro` is the uppercase bucket header Home uses ("OVERDUE 1").

export interface GroupHeaderProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  name: string;
  count?: number;
  /** For `state` headers: which icon to show. */
  group?: StateGroup;
  variant?: 'state' | 'micro';
  /** `danger` is for the Overdue bucket only. */
  tone?: 'default' | 'danger';
  /** Shows the "+" button on hover. */
  onAdd?: () => void;
  collapsed?: boolean;
  /** Shows the chevron that hides and shows the group. */
  onToggle?: () => void;
}

export const GroupHeader = React.forwardRef<HTMLDivElement, GroupHeaderProps>(function GroupHeader(
  { name, count, group, variant = 'state', tone = 'default', onAdd, collapsed, onToggle, className, ...props },
  ref,
) {
  if (variant === 'micro') {
    return (
      <GroupLabel {...props} ref={ref} count={count} tone={tone} className={className}>
        {name}
      </GroupLabel>
    );
  }
  return (
    <div {...props} ref={ref} className={cn('group/header flex h-8 items-center gap-2 bg-muted px-3', className)}>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? `Show ${name}` : `Hide ${name}`}
          className="-ml-1 -mr-[3px] inline-flex size-5 items-center justify-center rounded-sm text-subtle-foreground hover:text-foreground focus-visible:shadow-[var(--focus-ring)] focus-visible:outline-none"
        >
          <ChevronDown size={14} className={cn('transition-transform duration-200', collapsed && '-rotate-90')} aria-hidden="true" />
        </button>
      )}
      {group && <StateIcon group={group} decorative />}
      <h3 className="text-body font-semibold text-foreground">{name}</h3>
      {count !== undefined && <span className="tnum text-label text-subtle-foreground">{count}</span>}
      {onAdd && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onAdd}
          aria-label={`New work item in ${name}`}
          title={`New work item in ${name}`}
          className="ml-auto opacity-0 group-hover/header:opacity-100 focus-visible:opacity-100"
        >
          <Plus aria-hidden="true" />
        </Button>
      )}
    </div>
  );
});
GroupHeader.displayName = 'GroupHeader';

export interface GroupLabelProps extends React.ComponentPropsWithoutRef<'div'> {
  count?: number;
  /** `danger` is for the Overdue bucket only. */
  tone?: 'default' | 'danger';
}

/**
 * Group label (40.1 Inbox "TODAY", 30.1 Home "OVERDUE 1"): 11/600 uppercase on the
 * bottom of a 32px band, so it sits close to the rows it heads.
 */
export const GroupLabel = React.forwardRef<HTMLDivElement, GroupLabelProps>(function GroupLabel(
  { children, count, tone = 'default', className, ...props },
  ref,
) {
  return (
    <div {...props} ref={ref} className={cn('flex h-8 items-end gap-2 px-3 pb-1', className)}>
      <h3 className={cn('text-micro', tone === 'danger' ? 'text-danger-text' : 'text-subtle-foreground')}>{children}</h3>
      {count !== undefined && <span className="tnum text-label leading-4 font-normal text-subtle-foreground">{count}</span>}
    </div>
  );
});
GroupLabel.displayName = 'GroupLabel';
