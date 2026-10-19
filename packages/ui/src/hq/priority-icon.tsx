'use client';

import * as React from 'react';
import { cn } from '../lib/cn.ts';
import { PRIORITY_LABELS } from './types.ts';
import type { Priority } from './types.ts';

// Only urgent is coloured (rule 5.3); the rest are 3 bars with 1, 2 or 3 filled, so
// priority is readable without colour (brand-and-ux 5.9).

const FILLED: Record<Exclude<Priority, 'urgent'>, number> = { high: 3, medium: 2, low: 1, none: 0 };

export interface PriorityIconProps extends Omit<React.ComponentPropsWithoutRef<'svg'>, 'children'> {
  priority: Priority;
  size?: number;
  /** True when the priority is written next to it (menus, buttons). */
  decorative?: boolean;
}

export const PriorityIcon = React.forwardRef<SVGSVGElement, PriorityIconProps>(function PriorityIcon(
  { priority, size = 16, decorative = false, className, ...props },
  ref,
) {
  const label = priority === 'none' ? PRIORITY_LABELS.none : `${PRIORITY_LABELS[priority]} priority`;
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'img' as const, 'aria-label': label };
  if (priority === 'urgent') {
    return (
      <svg {...props} {...a11y} ref={ref} width={size} height={size} viewBox="0 0 16 16" className={cn('shrink-0', className)}>
        {!decorative && <title>{label}</title>}
        <rect x="1" y="1" width="14" height="14" rx="3" fill="#DC2626" />
        <path d="M8 4.25v4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="11.4" r="1.05" fill="#fff" />
      </svg>
    );
  }
  const filled = FILLED[priority];
  const bars = [
    { x: 3, h: 4 },
    { x: 7, h: 7 },
    { x: 11, h: 10 },
  ];
  return (
    <svg {...props} {...a11y} ref={ref} width={size} height={size} viewBox="0 0 16 16" className={cn('shrink-0', className)}>
      {!decorative && <title>{label}</title>}
      {bars.map((bar, i) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={13 - bar.h}
          width="2"
          height={bar.h}
          rx="0.75"
          className={i < filled ? 'fill-muted-foreground' : 'fill-faint'}
        />
      ))}
    </svg>
  );
});
PriorityIcon.displayName = 'PriorityIcon';
