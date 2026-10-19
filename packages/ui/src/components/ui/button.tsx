'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '../../lib/cn.ts';

// Sole sizes (brand-and-ux 5.5): sm 28px, default 32px, lg 36px, icon 32x32. Desktop
// only (D32), so there are no touch sizes. Press moves the button down half a pixel.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-[120ms] outline-none select-none active:translate-y-[0.5px] focus-visible:border-ring focus-visible:shadow-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover',
        destructive:
          'border border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        // The design's outline button sits on the canvas grey (60.5 Change date, 60.10
        // Cancel); an outline icon button is white (90.1 row menu), set below.
        outline:
          'border border-border bg-background text-foreground shadow-xs hover:bg-sidebar-hover',
        secondary:
          'border border-transparent bg-secondary text-secondary-foreground hover:bg-sidebar-hover',
        ghost:
          'border border-transparent text-muted-foreground hover:bg-sidebar-hover hover:text-foreground',
        link: 'border border-transparent px-0 text-link underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-3 text-body',
        xs: "h-6 gap-1 rounded-md px-2 text-label [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-7 px-2.5 text-label',
        lg: 'h-9 px-3.5 text-strong font-semibold',
        icon: 'size-8',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-7 rounded-md',
        'icon-lg': 'size-9',
      },
    },
    compoundVariants: [
      {
        variant: 'outline',
        size: ['icon', 'icon-xs', 'icon-sm', 'icon-lg'],
        class: 'bg-card text-muted-foreground hover:bg-row-hover hover:text-foreground',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(function Button({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
