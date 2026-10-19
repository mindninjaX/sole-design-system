'use client';

import * as React from 'react';
import { cn } from '../lib/cn.ts';
import { StateIcon } from './state-icon.tsx';
import type { StateGroup } from './types.ts';

// State with its name, for properties and column headers (brand-and-ux 5.8). Rows use
// the icon alone.

const TONES: Record<StateGroup, string> = {
  backlog: 'bg-neutral-soft text-neutral-text',
  unstarted: 'bg-neutral-soft text-neutral-text',
  started: 'bg-warning-soft text-warning-text',
  completed: 'bg-success-soft text-success-text',
  cancelled: 'bg-neutral-soft text-subtle-foreground',
};

export interface StatePillProps extends React.ComponentPropsWithoutRef<'span'> {
  state: { name: string; group: StateGroup };
}

export const StatePill = React.forwardRef<HTMLSpanElement, StatePillProps>(function StatePill({ state, className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      className={cn('inline-flex h-[22px] shrink-0 items-center gap-[5px] rounded-md px-2 text-label whitespace-nowrap', TONES[state.group], className)}
    >
      <StateIcon group={state.group} size={12} decorative />
      {state.name}
    </span>
  );
});
StatePill.displayName = 'StatePill';
