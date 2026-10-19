'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';

// Status pills (02-components.png 02.9; 90.1 Access): a 22px chip, 6px corners, 12/500.
// Four tones, following the colour rule (brand-and-ux 5.3): green for done or fine,
// amber for waiting on someone, grey for a plain fact, blue for something to act on.

export type PillTone = 'success' | 'warning' | 'neutral' | 'info';

const TONES: Record<PillTone, string> = {
  success: 'border-success-border bg-success-soft text-success-text',
  warning: 'border-warning-border bg-warning-soft text-warning-text',
  neutral: 'border-transparent bg-neutral-soft text-neutral-text',
  info: 'border-transparent bg-accent text-accent-foreground',
};

export interface PillProps extends React.ComponentPropsWithoutRef<'span'> {
  tone?: PillTone;
  /** A 12px icon before the text. */
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(function Pill({ tone = 'neutral', icon, children, className, ...props }, ref) {
  return (
    <span
      ref={ref}
      data-pill={tone}
      className={cn(
        'inline-flex h-[22px] max-w-full shrink-0 items-center gap-[5px] rounded-md border px-2 text-label whitespace-nowrap [&>svg]:size-3 [&>svg]:shrink-0',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
});
Pill.displayName = 'Pill';
