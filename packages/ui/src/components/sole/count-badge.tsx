'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';

// A count: 18px round, 11/600. `tint` is the default and is what the Inbox badge uses,
// for "3" and for "@ 2" alike (02-components.png). Red counts are reserved for
// deadlines, so there is no red variant here.

export interface CountBadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  children: React.ReactNode;
  variant?: 'tint' | 'muted';
  /** The accessible text, e.g. "2 unread mentions". */
  label?: string;
}

export const CountBadge = React.forwardRef<HTMLSpanElement, CountBadgeProps>(function CountBadge({ children, variant = 'tint', label, className, ...props }, ref) {
  return (
    <span
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'tnum inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-[5px] text-[11px] leading-none font-semibold',
        variant === 'tint' && 'bg-accent text-accent-foreground',
        variant === 'muted' && 'bg-muted text-subtle-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
});
CountBadge.displayName = 'CountBadge';
