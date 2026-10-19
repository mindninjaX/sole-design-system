'use client';

import * as React from 'react';
import { cn } from '../lib/cn.ts';

/** The eight note colours. */
import type { StickyColour } from './types.ts';

const STICKY_BG: Record<StickyColour, string> = {
  gray: 'bg-[var(--sticky-gray)]',
  peach: 'bg-[var(--sticky-peach)]',
  pink: 'bg-[var(--sticky-pink)]',
  orange: 'bg-[var(--sticky-orange)]',
  green: 'bg-[var(--sticky-green)]',
  'light-blue': 'bg-[var(--sticky-light-blue)]',
  'dark-blue': 'bg-[var(--sticky-dark-blue)]',
  purple: 'bg-[var(--sticky-purple)]',
};

export interface StickyProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  colour?: StickyColour;
  title?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * A sticky (30.1 Home): one of the 8 note colours, 8px corners, 12px padding, a 13/600
 * title and the note at 13px. Pass `onClick` or wrap it to edit; the body keeps its line breaks.
 */
export const Sticky = React.forwardRef<HTMLDivElement, StickyProps>(function Sticky({ colour = 'gray', title, children, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-sticky={colour}
      className={cn('flex min-h-[132px] min-w-0 flex-col rounded-lg p-3 text-sticky-foreground', STICKY_BG[colour], className)}
      {...props}
    >
      {title && <p className="truncate text-body leading-4 font-semibold">{title}</p>}
      {children && <div className={cn('text-body leading-[19px] whitespace-pre-line text-secondary-foreground', title && 'mt-[5px]')}>{children}</div>}
    </div>
  );
});
Sticky.displayName = 'Sticky';
