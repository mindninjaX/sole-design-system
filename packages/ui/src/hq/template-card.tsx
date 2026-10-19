'use client';

import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/cn.ts';

export interface TemplateCardProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'title'> {
  icon: LucideIcon;
  title: string;
  description: string;
  selected?: boolean;
}

/** Template card (60.10 New page): icon, 13/600 name, the 12px hint; selected is blue. */
export const TemplateCard = React.forwardRef<HTMLButtonElement, TemplateCardProps>(function TemplateCard(
  { icon: Icon, title, description, selected = false, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(
        'flex min-h-[108px] min-w-0 flex-col items-start rounded-lg border p-3 text-left outline-none transition-colors duration-[120ms] focus-visible:shadow-[var(--focus-ring)]',
        selected ? 'border-brand bg-accent shadow-[inset_0_0_0_0.5px_var(--brand)]' : 'border-border bg-card hover:bg-row-hover',
        className,
      )}
      {...props}
    >
      <Icon size={16} strokeWidth={1.8} aria-hidden="true" className={selected ? 'text-accent-foreground' : 'text-foreground'} />
      <span className={cn('mt-2 text-body font-semibold', selected ? 'text-accent-foreground' : 'text-foreground')}>{title}</span>
      <span className="mt-0.5 text-label font-normal text-subtle-foreground">{description}</span>
    </button>
  );
});
TemplateCard.displayName = 'TemplateCard';
