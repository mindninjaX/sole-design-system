'use client';

import * as React from 'react';
import { Checkbox } from '../components/ui/checkbox.tsx';
import { cn } from '../lib/cn.ts';

export interface ChecklistItemProps extends Omit<React.ComponentPropsWithoutRef<'label'>, 'children'> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
  /** read: 16/26 as in a description. body: 13/20 for denser lists. */
  size?: 'read' | 'body';
}

/**
 * Checklist item (50.6): a 16px checkbox and the line at the reading size; a done line
 * turns the subtle grey. The editor draws its task items the same way (editor.css).
 */
export const ChecklistItem = React.forwardRef<HTMLLabelElement, ChecklistItemProps>(function ChecklistItem(
  { checked, onCheckedChange, disabled, children, size = 'read', className, ...props },
  ref,
) {
  return (
    <label ref={ref} className={cn('flex min-w-0 items-start gap-2.5', size === 'read' ? 'text-read' : 'text-body', className)} {...props}>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onCheckedChange?.(v === true)}
        className={cn('shrink-0', size === 'read' ? 'mt-[5px]' : 'mt-0.5')}
      />
      <span className={cn('min-w-0', checked ? 'text-subtle-foreground' : 'text-foreground')}>{children}</span>
    </label>
  );
});
ChecklistItem.displayName = 'ChecklistItem';
