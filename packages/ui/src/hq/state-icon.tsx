'use client';

import { Circle, CircleCheck, CircleDashed, CircleX } from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn.ts';
import type { StateGroup } from './types.ts';

// One icon shape per state group, so Backlog and Todo differ by shape and not only by
// colour (brand-and-ux 5.8, U29). Colour is by group, never by the state's own hex.

/** In progress: a ring with its left half filled (5.8, 02-components.png). Lucide has no such icon. */
function CircleHalf({ size = 24, strokeWidth = 2, ...props }: LucideProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6.5a5.5 5.5 0 0 0 0 11z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICONS: Record<StateGroup, LucideIcon | typeof CircleHalf> = {
  backlog: CircleDashed,
  unstarted: Circle,
  started: CircleHalf,
  completed: CircleCheck,
  cancelled: CircleX,
};

const COLOURS: Record<StateGroup, string> = {
  backlog: 'text-state-backlog',
  unstarted: 'text-state-unstarted',
  started: 'text-state-started',
  completed: 'text-state-completed',
  cancelled: 'text-state-cancelled',
};

export const STATE_GROUP_LABELS: Record<StateGroup, string> = {
  backlog: 'Backlog',
  unstarted: 'Todo',
  started: 'In progress',
  completed: 'Done',
  cancelled: 'Cancelled',
};

export interface StateIconProps extends React.ComponentPropsWithoutRef<'span'> {
  group: StateGroup;
  /** The state's own name, for the tooltip and screen readers. Defaults to the group's name. */
  name?: string;
  size?: number;
  /** True when the name is already written next to it. */
  decorative?: boolean;
}

export const StateIcon = React.forwardRef<HTMLSpanElement, StateIconProps>(function StateIcon(
  { group, name, size = 16, decorative = false, className, ...props },
  ref,
) {
  const Icon = ICONS[group];
  const label = name ?? STATE_GROUP_LABELS[group];
  if (decorative) {
    return (
      <span {...props} ref={ref} aria-hidden="true" className={cn('inline-flex shrink-0', COLOURS[group], className)}>
        <Icon size={size} strokeWidth={1.8} />
      </span>
    );
  }
  return (
    <span {...props} ref={ref} role="img" aria-label={label} title={label} className={cn('inline-flex shrink-0', COLOURS[group], className)}>
      <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
});
StateIcon.displayName = 'StateIcon';
