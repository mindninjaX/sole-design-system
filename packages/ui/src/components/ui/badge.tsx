'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '../../lib/cn.ts';

// A badge is the 22px chip (brand-and-ux 5.5): 6px corners, 12/500, so it reads as a
// data label and never as a button. Colour follows the four meanings in 5.3.
const badgeVariants = cva(
  'inline-flex h-[22px] w-fit shrink-0 items-center justify-center gap-[5px] overflow-hidden rounded-md border px-2 text-label whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-neutral-soft text-neutral-text',
        outline: 'border-border bg-transparent text-muted-foreground',
        accent: 'border-transparent bg-accent text-accent-foreground',
        danger: 'border-danger-border bg-danger-soft text-danger-text',
        warning: 'border-warning-border bg-warning-soft text-warning-text',
        success: 'border-success-border bg-success-soft text-success-text',
        overdue: 'border-transparent bg-overdue text-overdue-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }
>(function Badge({ className, variant = 'default', asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      ref={ref}
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
