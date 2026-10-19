'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';
import { modKeyName } from '../../lib/platform.ts';

// A keyboard hint: "Cmd K" on a Mac, "Ctrl K" elsewhere (brand-and-ux 5.17). Pass
// 'mod' for the command key.

export interface KbdProps extends Omit<React.ComponentPropsWithoutRef<'kbd'>, 'children'> {
  keys: readonly string[];
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd({ keys, className, ...props }, ref) {
  const text = keys.map((k) => (k === 'mod' ? modKeyName() : k)).join(' ');
  return (
    <kbd
      ref={ref}
      className={cn(
        'inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-sm border border-border bg-muted px-1 font-sans text-[11px] leading-none font-medium text-muted-foreground',
        className,
      )}
      {...props}
    >
      {text}
    </kbd>
  );
});
Kbd.displayName = 'Kbd';

/** The same hint as words: "Cmd+K", or "Cmd K" with a space, as tooltips show it. */
export function keysText(keys: readonly string[], separator = '+'): string {
  return keys.map((k) => (k === 'mod' ? modKeyName() : k)).join(separator);
}
