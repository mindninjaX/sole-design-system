'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';

// Bars 12px tall, 4px corners, a 1.4s opacity pulse (brand-and-ux 5.15).
const Skeleton = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function Skeleton(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('h-3 animate-pulse rounded-sm bg-skeleton [animation-duration:1.4s]', className)}
      {...props}
    />
  );
});
Skeleton.displayName = 'Skeleton';

export { Skeleton };
