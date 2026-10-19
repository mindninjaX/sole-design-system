'use client';

import * as React from 'react';
import { cn } from '../../lib/cn.ts';

const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(function Input(
  { className, type, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'h-8 w-full min-w-0 rounded-md border border-input bg-field px-2.5 py-1 text-body transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-body file:font-medium file:text-foreground placeholder:text-subtle-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:shadow-[var(--focus-ring)]',
        // Invalid: the red border (10.2, 10.4). With focus it keeps the red and trades the
        // blue halo for a faint red one, so the focus still shows without mixing colours.
        'aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_14%,transparent)]',
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
