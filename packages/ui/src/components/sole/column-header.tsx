'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { Button } from '../ui/button.tsx';

/**
 * Column header for kanban (50.3): an icon, 13/600 name, count, and a + on the right.
 * The icon is the caller's (HQ passes its state icon), so the part knows no domain.
 */
export const ColumnHeader = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
    name: string;
    count?: number;
    /** Before the name: a 16px decorative icon. */
    icon?: React.ReactNode;
    /** Shows the + button when given. */
    onAdd?: () => void;
    /** The + button's name for screen readers and its tooltip. Defaults to "Add to <name>". */
    addLabel?: string;
  }
>(function ColumnHeader({ name, count, icon, onAdd, addLabel, className, ...props }, ref) {
  const label = addLabel ?? `Add to ${name}`;
  return (
    <div ref={ref} className={cn('flex h-8 min-w-0 items-center gap-2 pr-0.5 pl-1', className)} {...props}>
      {icon}
      <h3 className="truncate text-body font-semibold text-foreground">{name}</h3>
      {count !== undefined && <span className="tnum text-label font-normal text-subtle-foreground">{count}</span>}
      {onAdd && (
        <Button variant="ghost" size="icon-xs" onClick={onAdd} aria-label={label} title={label} className="ml-auto text-faint hover:text-foreground">
          <Plus aria-hidden="true" className="size-3.5" />
        </Button>
      )}
    </div>
  );
});
ColumnHeader.displayName = 'ColumnHeader';
